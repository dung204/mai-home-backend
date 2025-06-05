import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FindOneOptions } from 'typeorm';

import { BaseService, CustomFindManyOptions } from '@/base/services';

import { User } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(protected readonly repository: UsersRepository) {
    const logger = new Logger(UsersService.name);
    super(repository, logger);
  }

  protected async preFind(
    options: CustomFindManyOptions<User>,
    _currentUser?: User,
  ): Promise<CustomFindManyOptions<User>> {
    const preProcessedOptions = await super.preFind(options);

    return {
      ...preProcessedOptions,
      relations: {
        account: true,
      },
    };
  }

  protected preFindOne(options: FindOneOptions<User>, _currentUser?: User): FindOneOptions<User> {
    const preProcessedOptions = super.preFindOne(options);

    return {
      ...preProcessedOptions,
      relations: {
        account: true,
      },
    };
  }

  protected onFindOneNotFound(_options: FindOneOptions<User>, _currentUser?: User): void {
    throw new NotFoundException('User not found.');
  }
}
