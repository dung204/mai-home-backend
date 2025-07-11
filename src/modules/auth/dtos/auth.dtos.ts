import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsJWT,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';

import { SwaggerExamples } from '@/base/constants';

import { OAuthAction } from '../enums/oauth-action.enum';

export class LoginDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: SwaggerExamples.EMAIL,
    required: false,
  })
  @ValidateIf((obj) => !obj.phone)
  @IsNotEmpty()
  @IsEmail()
  @Length(6, 256)
  email?: string;

  @ApiProperty({
    description: 'The mobile phone of the user',
    example: SwaggerExamples.PHONE,
    required: false,
  })
  @ValidateIf((obj) => !obj.email)
  @IsNotEmpty()
  @IsMobilePhone('vi-VN')
  @Length(6, 256)
  phone?: string;

  @ApiProperty({
    description: 'The password of the user',
    example: SwaggerExamples.PASSWORD,
  })
  @IsNotEmpty()
  @Length(8, 100)
  password!: string;
}

export class RegisterDto extends LoginDto {}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'The old password of the user (not required if the user does not have a password)',
    example: SwaggerExamples.PASSWORD,
    required: false,
  })
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'The new password of the user',
    example: SwaggerExamples.PASSWORD,
  })
  @IsNotEmpty()
  newPassword!: string;
}

export class GetOtpDto {
  @ApiProperty({
    description: 'The email address to get the OTP',
    example: SwaggerExamples.EMAIL,
    required: false,
  })
  @IsEmail()
  @Length(6, 256)
  email!: string;
}

export class VerifyOtpDto extends GetOtpDto {
  @ApiProperty({
    description: 'The OTP to verify',
  })
  @IsNotEmpty()
  otp!: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'The JWT token to create new (refresh) the access token if it expires',
    example: SwaggerExamples.JWT_REFRESH_TOKEN,
  })
  @IsNotEmpty()
  @IsJWT()
  refreshToken!: string;
}

export class JwtPayloadDto {
  sub!: string;
  exp?: number;
}

class LoginUserPayload {
  @ApiProperty({
    description: 'The UUID of the user',
    example: SwaggerExamples.UUID,
  })
  id!: string;

  @ApiProperty({
    description: 'The email of the user',
    example: SwaggerExamples.EMAIL,
  })
  email!: string | null;

  @ApiProperty({
    description: 'The phone of the user',
    example: SwaggerExamples.PHONE,
  })
  phone!: string | null;

  @ApiProperty({
    description: 'The full name of the user',
    example: SwaggerExamples.FULLNAME,
    nullable: true,
  })
  displayName!: string | null;

  @ApiProperty({
    description: 'The avatar URL of the user',
    example: SwaggerExamples.URL,
    nullable: true,
  })
  avatar!: string | null;

  @ApiProperty({
    description: 'The Google ID of the user',
    example: SwaggerExamples.URL,
    nullable: true,
  })
  googleId!: string | null;
}

export class LoginSuccessDto {
  @ApiProperty({
    description: 'The JWT access token of the user',
    example: SwaggerExamples.JWT_ACCESS_TOKEN,
  })
  accessToken!: string;

  @ApiProperty({
    description: 'The JWT token to create new (refresh) the access token if it expires',
    example: SwaggerExamples.JWT_REFRESH_TOKEN,
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'The user data',
    type: LoginUserPayload,
  })
  user!: LoginUserPayload;
}

export class GoogleRequestDto {
  @ApiProperty({
    description: 'The authorization code retrieved from Google login',
    example: '4/0AanRRrsW0MyRmIrp4e-89quX3bMMZRK8_QW4efAGdcIwjr2bHwPs8ozJokN9fSqO5Mg9BQ',
  })
  @IsString()
  code!: string;

  @ApiProperty({
    description: 'The action to perform when a Google user info is retrieved successfully.',
    enum: OAuthAction,
    enumName: 'OAuthAction',
  })
  @IsEnum(OAuthAction, {
    message: `The OAuth action must be one of these values: ${Object.values(OAuthAction).join(', ')}`,
  })
  action!: OAuthAction;
}
