import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FindOneOptions, Raw } from 'typeorm';

import { BaseService, CustomFindManyOptions } from '@/base/services';
import { User } from '@/modules/users/entities/user.entity';

import { WardQueryDto } from '../dtos/location.dtos';
import { Ward } from '../entities/ward.entity';
import { WardsRepository } from '../repositories/wards.repository';
import { DistrictsService } from './districts.service';

@Injectable()
export class WardsService extends BaseService<Ward> {
  constructor(
    protected readonly repository: WardsRepository,
    private readonly districtsService: DistrictsService,
  ) {
    const logger = new Logger(WardsService.name);
    super(repository, logger);
  }

  protected async preFind(
    options: CustomFindManyOptions<Ward>,
    _currentUser?: User,
  ): Promise<CustomFindManyOptions<Ward>> {
    const preProcessedOptions = await super.preFind(options);

    if (preProcessedOptions.queryDto) {
      const { districtId, name } = preProcessedOptions.queryDto as WardQueryDto;

      const district = await this.districtsService.findOne({
        where: {
          id: districtId,
        },
      });

      preProcessedOptions.where = {
        ...preProcessedOptions.where,
        district: district!,
        ...(name && { name: Raw((alias) => `LOWER("${alias}") LIKE '%:name%'`, { name }) }),
      };
    }

    return {
      ...preProcessedOptions,
      relations: {
        district: true,
      },
    };
  }

  protected preFindOne(options: FindOneOptions<Ward>, _currentUser?: User): FindOneOptions<Ward> {
    const preProcessedOptions = super.preFindOne(options, _currentUser);

    return {
      ...preProcessedOptions,
      relations: {
        district: true,
      },
    };
  }

  protected onFindOneNotFound(_options: FindOneOptions<Ward>, _currentUser?: User) {
    throw new NotFoundException('Ward not found.');
  }
}
