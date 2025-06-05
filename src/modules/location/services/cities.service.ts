import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FindOneOptions, Raw } from 'typeorm';

import { BaseService, CustomFindManyOptions } from '@/base/services';
import { User } from '@/modules/users/entities/user.entity';

import { CityQueryDto } from '../dtos/location.dtos';
import { City } from '../entities/city.entity';
import { CitiesRepository } from '../repositories/cities.repository';

@Injectable()
export class CitiesService extends BaseService<City> {
  constructor(protected readonly repository: CitiesRepository) {
    const logger = new Logger(CitiesService.name);
    super(repository, logger);
  }

  protected async preFind(options: CustomFindManyOptions<City>, _currentUser?: User) {
    const preProcessedOptions = await super.preFind(options);

    if (preProcessedOptions.queryDto) {
      const { name } = preProcessedOptions.queryDto as CityQueryDto;

      preProcessedOptions.where = {
        ...preProcessedOptions.where,
        ...(name && { name: Raw((alias) => `LOWER("${alias}") LIKE '%:name%'`, { name }) }),
      };
    }

    return preProcessedOptions;
  }

  protected onFindOneNotFound(_options: FindOneOptions<City>, _currentUser?: User): void {
    throw new NotFoundException('City not found.');
  }
}
