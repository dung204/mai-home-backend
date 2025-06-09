import { Body, Controller, Delete, HttpCode, HttpStatus, Post, Request } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ApiSuccessResponse } from '@/base/decorators';
import { CustomRequest } from '@/base/dtos';

import { Public } from '../decorators/public.decorator';
import { GetOtpDto, LoginSuccessDto, RefreshTokenDto, VerifyOtpDto } from '../dtos/auth.dtos';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({
    summary: 'Get OTP using email or phone',
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
    summary: 'Verify OTP, then login if the account exists, otherwise register a new account',
  })
  @ApiSuccessResponse({
    status: HttpStatus.CREATED,
    schema: LoginSuccessDto,
    description: 'OTP verified successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'The email/phone is invalid.',
  })
  @Post('/verify-otp')
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
}
