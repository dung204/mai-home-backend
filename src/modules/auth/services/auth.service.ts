import { MailerService } from '@nestjs-modules/mailer';
import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { totp } from 'otplib';

import { configs } from '@/base/configs';
import { RedisService } from '@/base/database';
import { BaseService } from '@/base/services';
import { PasswordUtils } from '@/base/utils';
import { MediaService } from '@/modules/media/services';
import { User } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/services/users.service';

import {
  ChangePasswordDto,
  GetOtpDto,
  GoogleRequestDto,
  JwtPayloadDto,
  LoginDto,
  LoginSuccessDto,
  RegisterDto,
  VerifyOtpDto,
} from '../dtos/auth.dtos';
import { Account } from '../entities/account.entity';
import { OAuthAction } from '../enums/oauth-action.enum';
import { AccountRepository } from '../repository/account.repository';

@Injectable()
export class AuthService extends BaseService<Account> {
  private readonly ACCESS_EXPIRATION_TIME = 1800; // 30 minutes
  private readonly REFRESH_EXPIRATION_TIME = 604800; // 1 week
  private readonly BLACKLISTED = 'BLACKLISTED';
  private readonly TOTP_EXPIRATION_TIME = 300; // 5 minutes

  constructor(
    protected readonly repository: AccountRepository,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
    private readonly emailService: MailerService,
    private readonly httpService: HttpService,
    private readonly mediaService: MediaService,
  ) {
    const logger = new Logger(AuthService.name);
    super(repository, logger);
  }

  async login(payload: LoginDto): Promise<LoginSuccessDto> {
    const { email, phone, password } = payload;
    const account = await this.findOne({
      where: [{ email }, { phone }],
    });

    if (!account) {
      throw new UnauthorizedException('Email/phone or password is incorrect.');
    }

    const isMatchPassword = PasswordUtils.isMatchPassword(password, account.password ?? '');

    if (!isMatchPassword) {
      throw new UnauthorizedException('Email/phone or password is incorrect.');
    }

    const user = await this.usersService.findOne({
      where: { account },
      relations: {
        account: true,
      },
    });

    return {
      ...(await this.getTokens({ sub: user!.id })),
      user: {
        id: user!.id,
        email: user!.account.email,
        phone: user!.account.phone,
        displayName: user!.displayName,
        avatar: user!.avatar,
        googleId: user!.account.googleId,
      },
    };
  }

  async register(payload: RegisterDto): Promise<LoginSuccessDto> {
    const { email, phone, password } = payload;
    const existedAccount = await this.findOne({
      where: { email, phone },
      withDeleted: true,
    });
    const hashedPassword = PasswordUtils.hashPassword(password);

    if (!existedAccount) {
      const userId = randomUUID();

      const newAccount = await this.createOne(userId, {
        id: userId,
        email,
        phone,
        password: hashedPassword,
      });

      let userInfo: User | null = null;
      try {
        userInfo = await this.usersService.findOne({
          where: {
            account: newAccount,
          },
        });
      } catch (_err) {
        /* ignore NotFoundException */
      }

      if (!userInfo) {
        userInfo = await this.usersService.createOne(newAccount.id, {
          account: newAccount,
        });
      }

      return {
        ...(await this.getTokens({ sub: userInfo.id })),
        user: {
          id: userInfo.id,
          email: userInfo.account.email,
          phone: userInfo.account.phone,
          displayName: userInfo.displayName,
          avatar: userInfo.avatar,
          googleId: null,
        },
      };
    } else if (!existedAccount.deleteTimestamp) {
      throw new ConflictException('Email/phone has already been registered.');
    } else {
      let userInfo: User | null = null;
      try {
        userInfo = await this.usersService.findOne({
          where: {
            account: existedAccount,
          },
        });
      } catch (_err) {
        /* ignore NotFoundException */
      }

      if (!userInfo) {
        userInfo = await this.usersService.createOne(existedAccount.id, {
          account: existedAccount,
        });
      }

      await this.update(userInfo, {
        ...existedAccount,
        ...payload,
        password: hashedPassword,
        deleteTimestamp: null,
        deleteUserId: null,
      });

      return {
        ...(await this.getTokens({ sub: userInfo.id })),
        user: {
          id: userInfo.id,
          email: userInfo.account.email,
          phone: userInfo.account.phone,
          displayName: userInfo.displayName,
          avatar: userInfo.avatar,
          googleId: null,
        },
      };
    }
  }

  async changePassword(currentUser: User, payload: ChangePasswordDto) {
    const { password, newPassword } = payload;

    if (currentUser.account.password !== null) {
      if (!password) {
        throw new BadRequestException({
          message: 'Tài khoản đã thiết lập mật khẩu trước đó. Vui lòng nhập mật khẩu hiện tại.',
          field: 'password',
        });
      }

      if (!PasswordUtils.isMatchPassword(password, currentUser.account.password)) {
        throw new BadRequestException({
          message: 'Mật khẩu hiện tại không chính xác',
          field: 'password',
        });
      }
    }

    await this.update(
      currentUser,
      {
        password: PasswordUtils.hashPassword(newPassword),
      },
      {
        where: {
          id: currentUser.account.id,
        },
      },
    );
  }

  async getOtp(payload: GetOtpDto) {
    const { email } = payload;

    const otp = totp.generate(configs.OTP_SECRET_KEY);

    await this.redisService.set(`OTP_${email}`, otp, this.TOTP_EXPIRATION_TIME);

    if (email) {
      await this.emailService.sendMail({
        to: email,
        subject: `Mã đăng nhập vào Mai Home: ${otp}`,
        template: 'otp',
        context: {
          otp,
        },
      });
    }
  }

  async verifyOtp(payload: VerifyOtpDto) {
    const { email, otp } = payload;

    const storedOtp = await this.redisService.get(`OTP_${email}`, true);
    if (!storedOtp || otp !== storedOtp) {
      throw new UnauthorizedException();
    }
  }

  async refresh(refreshToken: string): Promise<LoginSuccessDto> {
    if (await this.isTokenBlacklisted(refreshToken)) {
      throw new UnauthorizedException('Refresh token is blacklisted.');
    }

    const { sub: userId } = this.jwtService.verify<JwtPayloadDto>(refreshToken, {
      secret: configs.REFRESH_SECRET_KEY,
    });

    const user = await this.usersService.findOne({
      where: {
        id: userId,
      },
      relations: {
        account: true,
      },
    });

    await this.blacklistToken(refreshToken);

    return {
      ...(await this.getTokens({ sub: userId })),
      user: {
        id: user!.id,
        email: user!.account.email,
        phone: user!.account.phone,
        displayName: user!.displayName,
        avatar: user!.avatar,
        googleId: user!.account.googleId,
      },
    };
  }

  async getTokens(payload: JwtPayloadDto) {
    const accessToken = this.jwtService.sign(payload, {
      secret: configs.ACCESS_SECRET_KEY,
      expiresIn: this.ACCESS_EXPIRATION_TIME,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: configs.REFRESH_SECRET_KEY,
      expiresIn: this.REFRESH_EXPIRATION_TIME,
    });

    await this.redisService.set(
      `REFRESH_TOKEN_${payload.sub}`,
      refreshToken,
      this.REFRESH_EXPIRATION_TIME,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(user: User, accessToken: string) {
    const refreshToken = await this.redisService.get(`REFRESH_TOKEN_${user.id}`, true);

    await this.blacklistToken(accessToken);
    if (refreshToken) await this.blacklistToken(refreshToken);
  }

  async handleGoogleAuth({ code, action }: GoogleRequestDto) {
    const accessToken = await this.getGoogleAccessToken(code);
    const googleUserInfo = await this.getGoogleUserInfo(accessToken);
    const existingAccount = await this.findOne({
      where: {
        email: googleUserInfo.email,
      },
    });

    switch (action) {
      case OAuthAction.AUTHENTICATE: {
        if (!existingAccount) {
          const userId = randomUUID();
          const newAccount = await this.createOne(userId, {
            id: userId,
            email: googleUserInfo.email,
            googleId: googleUserInfo.id,
          });

          const { fileName: avatar } = await this.mediaService.uploadFromUrl(
            googleUserInfo.picture as string,
            true,
            `avatars/${userId}`,
          );

          const userInfo = await this.usersService.createOne(newAccount.id, {
            account: newAccount,
            displayName: googleUserInfo.name,
            avatar,
          });

          return {
            ...(await this.getTokens({ sub: userInfo.id })),
            user: {
              id: userInfo.id,
              email: userInfo.account.email,
              phone: userInfo.account.phone,
              displayName: userInfo.displayName,
              avatar: userInfo.avatar,
            },
          };
        }

        if (existingAccount.googleId !== googleUserInfo.id) {
          throw new ConflictException('Found a user account that is not linked to Google.');
        }

        const user = await this.usersService.findOne({
          where: { account: existingAccount },
        });

        return {
          ...(await this.getTokens({ sub: user!.id })),
          user: {
            id: user!.id,
            email: user!.account.email,
            phone: user!.account.phone,
            displayName: user!.displayName,
            avatar: user!.avatar,
          },
        };
      }

      case OAuthAction.LINK: {
        if (!existingAccount) throw new NotFoundException('User not found.');

        if (existingAccount.googleId) {
          throw new ConflictException(
            'Can not link because a user already linked to Google has been found.',
          );
        }

        const user = await this.usersService.findOne({
          where: { account: existingAccount },
        });

        await this.update(
          user!,
          { googleId: googleUserInfo.id },
          {
            where: {
              id: existingAccount.id,
            },
          },
        );

        return {
          ...(await this.getTokens({ sub: user!.id })),
          user: {
            id: user!.id,
            email: user!.account.email,
            phone: user!.account.phone,
            displayName: user!.displayName,
            avatar: user!.avatar,
          },
        };
      }
    }
  }

  private async getGoogleAccessToken(code: string): Promise<string> {
    const {
      data: { access_token },
    } = await this.httpService.axiosRef.post('https://accounts.google.com/o/oauth2/token', {
      code,
      ...configs.GOOGLE,
    });

    return access_token;
  }

  private async getGoogleUserInfo(accessToken: string) {
    const { data } = await this.httpService.axiosRef.get(
      'https://www.googleapis.com/oauth2/v1/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return data;
  }

  async blacklistToken(token: string) {
    const { exp } = this.jwtService.decode(token);
    await this.redisService.set(token, this.BLACKLISTED, exp - Math.ceil(Date.now() / 1000));
  }

  async isTokenBlacklisted(token: string) {
    return (await this.redisService.get(token)) === this.BLACKLISTED;
  }
}
