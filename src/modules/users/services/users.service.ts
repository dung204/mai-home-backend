import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { FindManyOptions, FindOneOptions, IsNull } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { BaseService, CustomFindManyOptions } from '@/base/services';
import { AuthService } from '@/modules/auth/services/auth.service';

import { UpdateUserDto } from '../dtos/user.dtos';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    protected readonly repository: UsersRepository,
    @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService,
  ) {
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
    const { phone, email, ...dto } = updateDto;

    const [userWithExistedPhone, userWithExistedEmail] = (
      await Promise.allSettled([
        this.authService.findOne({
          where: {
            phone: !phone ? IsNull() : phone,
          },
          withDeleted: true,
        }),
        this.authService.findOne({
          where: {
            email: !email ? IsNull() : email,
          },
          withDeleted: true,
        }),
      ])
    ).map((result) => (result.status === 'fulfilled' ? result.value : null));

    if (userWithExistedPhone && userWithExistedPhone.id !== currentUser.id) {
      throw new ConflictException({
        message: `Số điện thoại đã tồn tại. Vui lòng chọn số điện thoại khác`,
        field: 'phone',
      });
    }

    if (userWithExistedEmail && userWithExistedEmail.id !== currentUser.id) {
      throw new ConflictException({
        message: `Email đã tồn tại. Vui lòng chọn email khác`,
        field: 'email',
      });
    }

    return {
      ...dto,
      account: {
        ...currentUser.account,
        phone,
        email,
      },
      updateUserId: currentUser.id,
    };
  }
}
