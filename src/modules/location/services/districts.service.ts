import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FindOneOptions, Raw } from 'typeorm';

import { BaseService, CustomFindManyOptions } from '@/base/services';
import { User } from '@/modules/users/entities/user.entity';

import { DistrictQueryDto } from '../dtos/location.dtos';
import { District } from '../entities/district.entity';
import { DistrictsRepository } from '../repositories/districts.repository';
import { CitiesService } from './cities.service';

@Injectable()
export class DistrictsService extends BaseService<District> {
  constructor(
    protected readonly repository: DistrictsRepository,
    private readonly citiesService: CitiesService,
  ) {
    const logger = new Logger(DistrictsService.name);
    super(repository, logger);
  }

  protected async preFind(
    options: CustomFindManyOptions<District>,
    _currentUser?: User,
  ): Promise<CustomFindManyOptions<District>> {
    const preProcessedOptions = await super.preFind(options);

    if (preProcessedOptions.queryDto) {
      const { cityId, name } = preProcessedOptions.queryDto as DistrictQueryDto;

      const city = await this.citiesService.findOne({
        where: {
          id: cityId,
        },
      });

      preProcessedOptions.where = {
        ...preProcessedOptions.where,
        city: city!,
        ...(name && {
          name: Raw((alias) => `unaccent(${alias}) ILIKE unaccent('%' || :name || '%')`, { name }),
        }),
      };
    }

    return preProcessedOptions;
  }

  protected async preFindOne(
    options: FindOneOptions<District>,
    _currentUser?: User,
  ): Promise<FindOneOptions<District>> {
    const preProcessedOptions = await super.preFindOne(options, _currentUser);

    return {
      ...preProcessedOptions,
      relations: {
        city: true,
      },
    };
  }

  protected async onFindOneNotFound(_options: FindOneOptions<District>, _currentUser?: User) {
    throw new NotFoundException('District not found.');
  }
}
