import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Exclude, Expose, Transform, plainToInstance } from 'class-transformer';
import {
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';

import { SwaggerExamples } from '@/base/constants';
import { OrderParams } from '@/base/decorators';
import { QueryDto } from '@/base/dtos';
import { StringUtils } from '@/base/utils';
import {
  CityResponseDto,
  DistrictResponseDto,
  WardResponseDto,
} from '@/modules/location/dtos/location.dtos';
import { City } from '@/modules/location/entities/city.entity';
import { District } from '@/modules/location/entities/district.entity';
import { Ward } from '@/modules/location/entities/ward.entity';
import { UserProfileDto } from '@/modules/users/dtos/user.dtos';
import { User } from '@/modules/users/entities/user.entity';

import { Property } from '../entities/property.entity';
import { PropertyCategory } from '../enums/property-category.enum';

@Exclude()
export class PropertyResponseDto {
  @ApiProperty({
    example: SwaggerExamples.UUID,
  })
  @Expose()
  id!: string;

  @ApiProperty({
    example: SwaggerExamples.TITLE,
  })
  @Expose()
  title!: string;

  @ApiProperty({
    format: 'textarea',
    example: SwaggerExamples.DESCRIPTION,
  })
  @Expose()
  description!: string;

  @ApiProperty({
    type: UserProfileDto,
  })
  @Transform(({ value }) => UserProfileDto.fromUser(value as User))
  @Expose()
  owner!: UserProfileDto;

  @ApiProperty({
    type: String,
    enum: PropertyCategory,
    enumName: 'PropertyCategory',
    example: PropertyCategory.ROOM,
  })
  @Expose()
  category!: PropertyCategory;

  @ApiProperty({
    type: CityResponseDto,
  })
  @Transform(({ value }) => CityResponseDto.fromCity(value as City))
  @Expose()
  city!: CityResponseDto;

  @ApiProperty({
    type: DistrictResponseDto,
  })
  @Transform(({ value }) => DistrictResponseDto.fromDistrict(value as District))
  @Expose()
  district!: DistrictResponseDto;

  @ApiProperty({
    type: WardResponseDto,
  })
  @Transform(({ value }) => WardResponseDto.fromWard(value as Ward))
  @Expose()
  ward!: WardResponseDto;

  @ApiProperty({
    format: 'textarea',
    example: SwaggerExamples.ADDRESS,
  })
  @Expose()
  address!: string;

  @ApiProperty({
    type: String,
    example: SwaggerExamples.LATITUDE.toString(),
  })
  @Expose()
  latitude!: string | null;

  @ApiProperty({
    type: String,
    example: SwaggerExamples.LONGITUDE.toString(),
  })
  @Expose()
  longitude!: string | null;

  @ApiProperty({
    example: SwaggerExamples.PRICE.toString(),
  })
  @Expose()
  minPricePerMonth!: string;

  @ApiProperty({
    example: SwaggerExamples.PRICE.toString(),
  })
  @Expose()
  maxPricePerMonth!: string;

  @ApiProperty({
    example: SwaggerExamples.AREA.toString(),
  })
  @Expose()
  minArea!: string;

  @ApiProperty({
    example: SwaggerExamples.AREA.toString(),
  })
  @Expose()
  maxArea!: string;

  @ApiProperty({
    example: [SwaggerExamples.URL],
  })
  @Expose()
  images!: string[];

  @ApiProperty({
    example: [SwaggerExamples.URL],
  })
  @Expose()
  videos!: string[];

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

  public static fromProperty(property: Property) {
    return plainToInstance(PropertyResponseDto, property);
  }
}

@Exclude()
export class DeletedPropertyResponseDto extends PropertyResponseDto {
  @ApiProperty({
    description: 'The timestamp indicating when the user is deleted',
    example: SwaggerExamples.DATE_FROM,
  })
  @Expose()
  deleteTimestamp!: Date;

  public static fromProperty(property: Property) {
    return plainToInstance(DeletedPropertyResponseDto, property);
  }
}

export class PropertyQueryDto extends QueryDto {
  @OrderParams(['createTimestamp', 'category', 'pricePerMonth', 'area'])
  order: string[] = [];

  @IsOptional()
  title?: string;

  @ApiProperty({
    type: String,
    enum: PropertyCategory,
    enumName: 'PropertyCategory',
    required: false,
  })
  @IsOptional()
  category?: PropertyCategory;

  @ApiProperty({
    type: String,
    enum: PropertyCategory,
    enumName: 'PropertyCategory',
    required: false,
  })
  @IsOptional()
  owner?: string;

  @ApiProperty({
    example: SwaggerExamples.CITY_ID,
    required: false,
  })
  @IsOptional()
  city?: string;

  @ApiProperty({
    example: SwaggerExamples.DISTRICT_ID,
    required: false,
  })
  @IsOptional()
  district?: string;

  @ApiProperty({
    example: SwaggerExamples.WARD_ID,
    required: false,
  })
  @IsOptional()
  ward?: string;

  @ApiProperty({
    example: SwaggerExamples.PRICE,
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  minPricePerMonth?: string;

  @ApiProperty({
    example: SwaggerExamples.PRICE,
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  maxPricePerMonth?: string;

  @ApiProperty({
    example: SwaggerExamples.AREA,
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  minArea?: string;

  @ApiProperty({
    example: SwaggerExamples.AREA,
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  maxArea?: string;
}

export class DeletedPropertyQueryDto extends PropertyQueryDto {
  @OrderParams(['createTimestamp', 'deletedTimestamp', 'category', 'pricePerMonth', 'area'])
  order: string[] = [];
}

export class CreatePropertyDto {
  @ApiProperty({
    format: 'uuid',
    example: SwaggerExamples.UUID,
  })
  @IsOptional()
  @IsUUID(4)
  id!: string;

  @ApiProperty({
    format: 'textarea',
    example: SwaggerExamples.TITLE,
  })
  @IsNotEmpty()
  @MinLength(30)
  @MaxLength(100)
  title!: string;

  @ApiProperty({
    format: 'textarea',
    example: SwaggerExamples.DESCRIPTION,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(50)
  @MaxLength(5000)
  description!: string;

  @ApiProperty({
    type: String,
    enum: PropertyCategory,
    enumName: 'PropertyCategory',
  })
  @IsNotEmpty()
  @IsEnum(PropertyCategory)
  category!: PropertyCategory;

  @ApiProperty({
    example: SwaggerExamples.CITY_ID,
  })
  @IsNotEmpty()
  cityId!: string;

  @ApiProperty({
    example: SwaggerExamples.DISTRICT_ID,
  })
  @IsNotEmpty()
  districtId!: string;

  @ApiProperty({
    example: SwaggerExamples.WARD_ID,
  })
  @IsNotEmpty()
  wardId!: string;

  @ApiProperty({
    format: 'textarea',
    example: StringUtils.generateRandomString({
      count: 1,
      units: 'sentences',
      sentenceLowerBound: 4,
      sentenceUpperBound: 10,
    }),
  })
  @IsNotEmpty()
  address!: string;

  @ApiProperty({
    type: Number,
    example: SwaggerExamples.LATITUDE,
    required: false,
  })
  latitude?: string;

  @ApiProperty({
    type: Number,
    example: SwaggerExamples.LONGITUDE,
    required: false,
  })
  longitude?: string;

  @ApiProperty({
    type: Number,
    format: 'currency',
    example: SwaggerExamples.PRICE,
  })
  @IsDecimal()
  @Validate((value: string) => parseFloat(value) > 0)
  minPricePerMonth!: string;

  @ApiProperty({
    type: Number,
    format: 'currency',
    example: SwaggerExamples.PRICE,
  })
  @IsDecimal()
  @Validate((value: string) => parseFloat(value) > 0)
  maxPricePerMonth!: string;

  @ApiProperty({
    type: Number,
    minimum: 0,
    example: SwaggerExamples.AREA,
  })
  @IsDecimal()
  @Validate((value: string) => parseFloat(value) > 0)
  minArea!: string;

  @ApiProperty({
    type: Number,
    minimum: 0,
    example: SwaggerExamples.AREA,
  })
  @IsDecimal()
  @Validate((value: string) => parseFloat(value) > 0)
  maxArea!: string;

  @ApiProperty({
    example: [SwaggerExamples.URL],
    required: false,
  })
  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
  images?: string[];

  @ApiProperty({
    example: [SwaggerExamples.URL],
    required: false,
  })
  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
  videos?: string[];
}

export class UpdatePropertyDto extends PartialType(OmitType(CreatePropertyDto, ['id'])) {}
