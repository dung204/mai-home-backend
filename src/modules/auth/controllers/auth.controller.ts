import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ApiSuccessResponse } from '@/base/decorators';
import { CustomRequest } from '@/base/dtos';
import { User } from '@/modules/users/entities/user.entity';

import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import {
  ChangePasswordDto,
  GetOtpDto,
  GoogleRequestDto,
  LoginDto,
  LoginSuccessDto,
  RefreshTokenDto,
  RegisterDto,
  VerifyOtpDto,
} from '../dtos/auth.dtos';
import { OAuthAction } from '../enums/oauth-action.enum';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({
    summary: 'Login',
  })
  @ApiSuccessResponse({
    schema: LoginSuccessDto,
    isArray: false,
    description: 'Login successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'The email or password is invalid.',
  })
  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @ApiOperation({
    summary: 'Register',
  })
  @ApiSuccessResponse({
    status: HttpStatus.CREATED,
    schema: LoginSuccessDto,
    description: 'Register successfully',
  })
  @ApiConflictResponse({
    description: 'Email already taken',
  })
  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @ApiOperation({
    summary: 'Get OTP using email',
  })
  @ApiNoContentResponse({
    description: 'OTP has been sent',
  })
  @ApiUnauthorizedResponse({
    description: 'The email/phone is invalid.',
  })
  @Post('/get-otp')
  @HttpCode(HttpStatus.NO_CONTENT)
  async getOtp(@Body() getOtpDto: GetOtpDto) {
    return this.authService.getOtp(getOtpDto);
  }

  @Public()
  @ApiOperation({
    summary: 'Change password of the current user',
  })
  @ApiNoContentResponse({
    description: 'Password changed successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'The email/phone is invalid.',
  })
  @Patch('/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @CurrentUser() currentUser: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(currentUser, changePasswordDto);
  }

  @Public()
  @ApiOperation({
    summary: 'Verify OTP',
  })
  @ApiNoContentResponse({
    description: 'OTP verified successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'The email/phone is invalid.',
  })
  @Post('/verify-otp')
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Public()
  @ApiOperation({
    summary: 'Create new (refresh) tokens',
  })
  @ApiSuccessResponse({
    status: HttpStatus.CREATED,
    schema: LoginSuccessDto,
    description: 'Refresh token successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token is blacklisted',
  })
  @ApiBadRequestResponse({
    description: 'JWT error (malformed, expired, ...)',
  })
  @Post('/refresh')
  async refreshToken(@Body() { refreshToken }: RefreshTokenDto) {
    return this.authService.refresh(refreshToken);
  }

  @ApiOperation({
    summary: 'Logout',
  })
  @ApiNoContentResponse({
    description: 'Logout successfully',
  })
  @Delete('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Request() req: CustomRequest) {
    // @ts-expect-error authorization does exist in req.headers
    const accessToken: string = req.headers.authorization!.replaceAll('Bearer ', '');
    await this.authService.logout(req.user!, accessToken);
  }

  @Public()
  @ApiOperation({
    summary: 'Handle Google authentication',
  })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    description: 'Successful authentication',
    schema: LoginSuccessDto,
    isArray: false,
  })
  @ApiConflictResponse({
    description: `Due to one of the two reasons:\n- For \`${OAuthAction.AUTHENTICATE}\` action, a user that is not linked to Google has been found.\n- For \`${OAuthAction.LINK}\` action, a user that is already linked to Google has been found.`,
  })
  @Post('/google')
  async handleGoogleAuth(@Body() googleRequest: GoogleRequestDto) {
    return this.authService.handleGoogleAuth(googleRequest);
  }
}
