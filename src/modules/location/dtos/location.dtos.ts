import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToInstance } from 'class-transformer';
import { IsOptional } from 'class-validator';

import { SwaggerExamples } from '@/base/constants';
import { OrderParams } from '@/base/decorators';
import { QueryDto } from '@/base/dtos';

import { City } from '../entities/city.entity';
import { District } from '../entities/district.entity';
import { Ward } from '../entities/ward.entity';

@Exclude()
export class CityResponseDto {
  @ApiProperty({
    example: SwaggerExamples.CITY_ID,
  })
  @Expose()
  id!: string;

  @ApiProperty({
    example: 'Hà Nội',
  })
  @Expose()
  name!: string;

  static fromCity(city: City) {
    return plainToInstance(CityResponseDto, city);
  }
}

@Exclude()
export class DistrictResponseDto {
  @ApiProperty({
    example: SwaggerExamples.DISTRICT_ID,
  })
  @Expose()
  id!: string;

  @ApiProperty({
    example: 'Tây Hồ',
  })
  @Expose()
  name!: string;

  static fromDistrict(district: District) {
    return plainToInstance(DistrictResponseDto, district);
  }
}

@Exclude()
export class WardResponseDto {
  @ApiProperty({
    example: SwaggerExamples.WARD_ID,
  })
  @Expose()
  id!: string;

  @ApiProperty({
    example: 'Phú Thượng',
  })
  @Expose()
  name!: string;

  static fromWard(ward: Ward) {
    return plainToInstance(WardResponseDto, ward);
  }
}

export class CityQueryDto extends QueryDto {
  @OrderParams(['name', 'createTimestamp'])
  order: string[] = [];

  @ApiProperty({
    description: 'City name to filter',
    required: false,
  })
  @IsOptional()
  name?: string;
}

export class DistrictQueryDto extends QueryDto {
  @OrderParams(['name', 'createTimestamp'])
  order: string[] = [];

  @ApiProperty({
    description: 'District name to filter',
    required: false,
  })
  @IsOptional()
  name?: string;

  @Exclude()
  cityId?: string;
}

export class WardQueryDto extends QueryDto {
  @OrderParams(['name', 'createTimestamp'])
  order: string[] = [];

  @ApiProperty({
    description: 'Ward name to filter',
    required: false,
  })
  @IsOptional()
  name?: string;

  @Exclude()
  districtId?: string;
}
