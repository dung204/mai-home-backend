import { Controller, Get, Param, Query } from '@nestjs/common';

import { ApiSuccessResponse } from '@/base/decorators';
import { Public } from '@/modules/auth/decorators/public.decorator';

import {
  CityQueryDto,
  CityResponseDto,
  DistrictQueryDto,
  DistrictResponseDto,
  WardQueryDto,
  WardResponseDto,
} from '../dtos/location.dtos';
import { CitiesService } from '../services/cities.service';
import { DistrictsService } from '../services/districts.service';
import { WardsService } from '../services/wards.service';

@Controller('location')
export class LocationController {
  constructor(
    private readonly citiesService: CitiesService,
    private readonly districtsService: DistrictsService,
    private readonly wardsService: WardsService,
  ) {}

  @ApiSuccessResponse({
    description: 'Retrieved all cities successfully',
    schema: CityResponseDto,
    isArray: true,
    hasMetadata: true,
  })
  @Public()
  @Get('/cities')
  async findAllCities(@Query() cityQueryDto: CityQueryDto) {
    const { data, metadata } = await this.citiesService.find({
      queryDto: cityQueryDto,
    });

    return {
      data: data.map((city) => CityResponseDto.fromCity(city)),
      metadata,
    };
  }

  @ApiSuccessResponse({
    description: 'Retrieved all districts successfully',
    schema: DistrictResponseDto,
    isArray: true,
    hasMetadata: true,
  })
  @Public()
  @Get('/districts/:cityId')
  async findAllDistrictsByCityId(
    @Param('cityId') cityId: string,
    @Query() districtQueryDto: DistrictQueryDto,
  ) {
    const { data, metadata } = await this.districtsService.find({
      queryDto: { ...districtQueryDto, cityId },
    });

    return {
      data: data.map((district) => DistrictResponseDto.fromDistrict(district)),
      metadata,
    };
  }

  @ApiSuccessResponse({
    description: 'Retrieved all wards successfully',
    schema: WardResponseDto,
    isArray: true,
    hasMetadata: true,
  })
  @Public()
  @Get('/wards/:districtId')
  async findAllWardsByDistrictId(
    @Param('districtId') districtId: string,
    @Query() wardQueryDto: WardQueryDto,
  ) {
    const { data, metadata } = await this.wardsService.find({
      queryDto: { ...wardQueryDto, districtId },
    });

    return {
      data: data.map((ward) => WardResponseDto.fromWard(ward)),
      metadata,
    };
  }
}
