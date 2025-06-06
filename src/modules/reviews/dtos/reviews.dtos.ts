import { ApiHideProperty, ApiProperty, PartialType } from '@nestjs/swagger';
import { Exclude, Expose, Transform, plainToInstance } from 'class-transformer';
import { IsInt, Max, MaxLength, Min, MinLength } from 'class-validator';

import { SwaggerExamples } from '@/base/constants';
import { OrderParams } from '@/base/decorators';
import { QueryDto } from '@/base/dtos';
import { UserProfileDto } from '@/modules/users/dtos/user.dtos';
import { User } from '@/modules/users/entities/user.entity';

import { Review } from '../entities/reviews.entity';

@Exclude()
export class ReviewResponseDto {
  @ApiProperty({
    type: UserProfileDto,
  })
  @Transform(({ value }) => UserProfileDto.fromUser(value as User))
  @Expose()
  user!: UserProfileDto;

  @ApiProperty({
    example: 5,
  })
  @Expose()
  stars!: number;

  @ApiProperty({
    example: SwaggerExamples.TITLE,
  })
  @Expose()
  content!: string;

  @ApiProperty({
    description: 'The timestamp indicating when the property is created',
    example: SwaggerExamples.DATE_FROM,
  })
  @Expose()
  createTimestamp!: Date;

  @ApiProperty({
    description: 'The timestamp indicating when the property is last updated',
    example: SwaggerExamples.DATE_FROM,
  })
  @Expose()
  updateTimestamp!: Date;

  public static fromReview(review: Review) {
    return plainToInstance(ReviewResponseDto, review);
  }
}

export class ReviewQueryDto extends QueryDto {
  @OrderParams(['createTimestamp', 'stars'])
  order: string[] = [];

  @ApiProperty({
    example: 1,
    required: false,
  })
  @Transform(({ value }) => parseInt(value as string))
  minStars?: number;

  @ApiProperty({
    example: 5,
    required: false,
  })
  @Transform(({ value }) => parseInt(value as string))
  maxStars?: number;
}

export class CreateReviewDto {
  @ApiHideProperty()
  @Exclude()
  propertyId!: string;

  @ApiProperty({
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => parseInt(value as string))
  stars!: number;

  @ApiProperty({
    format: 'textarea',
    example: SwaggerExamples.TITLE,
  })
  @MinLength(30)
  @MaxLength(500)
  content!: string;
}

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}
