import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsJWT, IsNotEmpty, Length } from 'class-validator';

import { SwaggerExamples } from '@/base/constants';

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
