import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { BaseService, CustomFindManyOptions } from '@/base/services';

import { UpdateUserDto } from '../dtos/user.dtos';
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

  protected async preFindOne(
    options: FindOneOptions<User>,
    _currentUser?: User,
  ): Promise<FindOneOptions<User>> {
    const preProcessedOptions = await super.preFindOne(options);

    return {
      ...preProcessedOptions,
      relations: {
        account: true,
      },
    };
  }

  protected async onFindOneNotFound(_options: FindOneOptions<User>, _currentUser?: User) {
    throw new NotFoundException('User not found.');
  }

  protected async preUpdate(
    currentUser: User,
    updateDto: UpdateUserDto,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _oldRecords: User[],
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _options?: FindManyOptions<User>,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
  ): Promise<QueryDeepPartialEntity<User>> {
    const { phone, ...dto } = updateDto;

    return {
      ...dto,
      account: {
        ...currentUser.account,
        phone,
      },
      updateUserId: currentUser.id,
    };
  }
}
