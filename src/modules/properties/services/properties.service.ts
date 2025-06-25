import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DeepPartial, FindOneOptions, LessThanOrEqual, MoreThanOrEqual, Raw } from 'typeorm';

import { BaseService, CustomFindManyOptions } from '@/base/services';
import { CitiesService } from '@/modules/location/services/cities.service';
import { DistrictsService } from '@/modules/location/services/districts.service';
import { WardsService } from '@/modules/location/services/wards.service';
import { User } from '@/modules/users/entities/user.entity';

import { CreatePropertyDto, PropertyQueryDto } from '../dtos/properties.dtos';
import { Property } from '../entities/property.entity';
import { PropertiesRepository } from '../repositories/properties.repository';

@Injectable()
export class PropertiesService extends BaseService<Property> {
  constructor(
    protected readonly repository: PropertiesRepository,
    private readonly citiesService: CitiesService,
    private readonly districtsService: DistrictsService,
    private readonly wardsService: WardsService,
  ) {
    const logger = new Logger(PropertiesService.name);
    super(repository, logger);
  }

  protected async preFind(
    options: CustomFindManyOptions<Property>,
    _currentUser?: User,
  ): Promise<CustomFindManyOptions<Property>> {
    const preProcessedOptions = await super.preFind(options, _currentUser);

    if (preProcessedOptions.queryDto) {
      const {
        title,
        category,
        owner: ownerId,
        city: cityId,
        district: districtId,
        ward: wardId,
        minPricePerMonth,
        maxPricePerMonth,
        minArea,
        maxArea,
      } = preProcessedOptions.queryDto as PropertyQueryDto;

      preProcessedOptions.where = {
        ...preProcessedOptions.where,
        ...(ownerId && { ownerId }),
        ...(title && { title: Raw((alias) => `LOWER("${alias}") LIKE '%:title%'`, { title }) }),
        ...(category && { category }),
        ...(cityId && { cityId }),
        ...(districtId && { districtId }),
        ...(wardId && { wardId }),
        ...(minPricePerMonth && {
          minPricePerMonth: LessThanOrEqual(Number.MAX_VALUE.toString()),
          maxPricePerMonth: MoreThanOrEqual(minPricePerMonth),
        }),
        ...(maxPricePerMonth && {
          minPricePerMonth: LessThanOrEqual(maxPricePerMonth),
          maxPricePerMonth: MoreThanOrEqual(Number.MAX_VALUE.toString()),
        }),
        ...(minPricePerMonth &&
          maxPricePerMonth && {
            minPricePerMonth: LessThanOrEqual(maxPricePerMonth),
            maxPricePerMonth: MoreThanOrEqual(minPricePerMonth),
          }),
        ...(minArea && {
          minArea: LessThanOrEqual(Number.MAX_VALUE.toString()),
          maxArea: MoreThanOrEqual(minArea),
        }),
        ...(maxArea && {
          minArea: LessThanOrEqual(maxArea),
          maxArea: MoreThanOrEqual(Number.MAX_VALUE.toString()),
        }),
        ...(minArea &&
          maxArea && {
            minArea: LessThanOrEqual(maxArea),
            maxArea: MoreThanOrEqual(minArea),
          }),
      };
    }

    return {
      ...preProcessedOptions,
      relations: {
        owner: {
          account: true,
        },
        city: true,
        district: true,
        ward: true,
      },
    };
  }

  protected async preFindOne(
    options: FindOneOptions<Property>,
    _currentUser?: User,
  ): Promise<FindOneOptions<Property>> {
    const preProcessedOptions = await super.preFindOne(options, _currentUser);

    return {
      ...preProcessedOptions,
      relations: {
        owner: {
          account: true,
        },
        city: true,
        district: true,
        ward: true,
      },
    };
  }

  protected async onFindOneNotFound(_options: FindOneOptions<Property>, _currentUser?: User) {
    throw new NotFoundException('Property not found.');
  }

  protected async preCreateOne(
    userId: string,
    createDto: CreatePropertyDto,
    currentUser: User,
  ): Promise<DeepPartial<Property>> {
    const preProcessedOptions = await super.preCreateOne(userId, createDto, currentUser);
    const { cityId, districtId, wardId, minPricePerMonth, maxPricePerMonth, minArea, maxArea } =
      createDto;

    if (minPricePerMonth > maxPricePerMonth) {
      throw new BadRequestException(
        'minPricePerMonth must be smaller or equal to maxPricePerMonth',
      );
    }

    if (minArea > maxArea) {
      throw new BadRequestException('minArea must be smaller or equal to maxArea');
    }

    const city = await this.citiesService.findOne({
      where: {
        id: cityId,
      },
    });

    const district = await this.districtsService.findOne({
      where: {
        id: districtId,
      },
    });

    if (district!.city.id !== city!.id) {
      throw new BadRequestException('Location is invalid!');
    }

    const ward = await this.wardsService.findOne({
      where: {
        id: wardId,
      },
    });

    if (ward!.district.id !== district!.id) {
      throw new BadRequestException('Location is invalid!');
    }

    return {
      ...preProcessedOptions,
      owner: currentUser,
      city: city!,
      district: district!,
      ward: ward!,
    };
  }
}
