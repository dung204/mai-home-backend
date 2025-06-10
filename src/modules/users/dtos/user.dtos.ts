import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, plainToInstance } from 'class-transformer';
import { IsOptional, IsString, IsUrl } from 'class-validator';

import { SwaggerExamples } from '@/base/constants';
import { Role } from '@/modules/auth/enums/role.enum';

import { User } from '../entities/user.entity';

@Exclude()
export class UserProfileDto {
  @ApiProperty({
    description: 'The UUID of the user',
    example: SwaggerExamples.UUID,
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'The email of the user',
    example: SwaggerExamples.EMAIL,
  })
  @Expose()
  @Transform(({ obj: user }) => user.account.email)
  email!: string | null;

  @ApiProperty({
    description: 'The mobile phone of the user',
    example: SwaggerExamples.PHONE,
  })
  @Expose()
  @Transform(({ obj: user }) => user.account.phone)
  phone!: string | null;

  @ApiProperty({
    description: 'The role of the user',
    example: SwaggerExamples.ROLE,
  })
  @Expose()
  @Transform(({ obj: user }) => user.account.role)
  role!: Role;

  @ApiProperty({
    description: 'The display name of the user',
    example: SwaggerExamples.FULLNAME,
  })
  @Expose()
  displayName!: string;

  @ApiProperty({
    description: 'The timestamp indicating when the user is created',
    example: SwaggerExamples.DATE_FROM,
  })
  @Expose()
  createTimestamp!: Date;

  @ApiProperty({
    description: 'The timestamp indicating when the user is last updated',
    example: SwaggerExamples.DATE_FROM,
  })
  @Expose()
  updateTimestamp!: Date;

  public static fromUser(user: User) {
    return plainToInstance(UserProfileDto, user);
  }
}

@Exclude()
export class DeletedUserProfileDto extends UserProfileDto {
  @ApiProperty({
    description: 'The timestamp indicating when the user is deleted',
    example: SwaggerExamples.DATE_FROM,
  })
  @Expose()
  deleteTimestamp!: Date;

  public static fromUser(user: User) {
    return plainToInstance(DeletedUserProfileDto, user);
  }
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'The phone of the user',
    example: SwaggerExamples.PHONE,
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'The full name of the user',
    example: SwaggerExamples.FULLNAME,
    required: false,
  })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({
    description: 'The avatar URL of the user',
    example: SwaggerExamples.URL,
    required: false,
  })
  @IsOptional()
  @IsUrl()
  avatar?: string;
}
