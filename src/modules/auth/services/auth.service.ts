import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { totp } from 'otplib';

import { configs } from '@/base/configs';
import { RedisService } from '@/base/database';
import { BaseService } from '@/base/services';
import { User } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/services/users.service';

import { GetOtpDto, JwtPayloadDto, LoginSuccessDto, VerifyOtpDto } from '../dtos/auth.dtos';
import { Account } from '../entities/account.entity';
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
    private readonly usersService: UsersService,
    private readonly emailService: MailerService,
  ) {
    const logger = new Logger(AuthService.name);
    super(repository, logger);
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

    const account = await this.findOne({
      where: { email },
      withDeleted: true,
    });

    if (!account) {
      const userId = randomUUID();

      const newAccount = await this.createOne(userId, {
        id: userId,
        email,
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
          displayName: userInfo.displayName,
        },
      };
    } else if (account.deleteTimestamp) {
      throw new UnauthorizedException('Account has been disabled!');
    } else {
      let userInfo: User | null = null;
      try {
        userInfo = await this.usersService.findOne({
          where: {
            account,
          },
        });
      } catch (_err) {
        /* ignore NotFoundException */
      }

      if (!userInfo) {
        userInfo = await this.usersService.createOne(account.id, {
          account,
        });
      }

      return {
        ...(await this.getTokens({ sub: userInfo.id })),
        user: {
          id: userInfo.id,
          displayName: userInfo.displayName,
        },
      };
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
    });

    await this.blacklistToken(refreshToken);

    return {
      ...(await this.getTokens({ sub: userId })),
      user: {
        id: user!.id,
        displayName: user!.displayName,
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

  async blacklistToken(token: string) {
    const { exp } = this.jwtService.decode(token);
    await this.redisService.set(token, this.BLACKLISTED, exp - Math.ceil(Date.now() / 1000));
  }

  async isTokenBlacklisted(token: string) {
    return (await this.redisService.get(token)) === this.BLACKLISTED;
  }
}
