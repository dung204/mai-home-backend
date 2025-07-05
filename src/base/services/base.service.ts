import { InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { User } from '@/modules/users/entities/user.entity';

import { PaginationDto, QueryDto } from '../dtos';
import { BaseEntity } from '../entities';

export interface CustomFindManyOptions<Entity extends BaseEntity> extends FindManyOptions<Entity> {
  queryDto?: QueryDto & Record<string, any>;
}

export class BaseService<Entity extends BaseEntity> {
  protected logger: Logger;

  constructor(
    protected readonly repository: Repository<Entity>,
    logger: Logger,
  ) {
    this.logger = logger;
  }

  async find(options: CustomFindManyOptions<Entity> = {}, currentUser?: User) {
    const preProcessedOptions = await this.preFind(options, currentUser);
    const data = await this.repository.find(preProcessedOptions);
    return this.postFind(data, preProcessedOptions, currentUser);
  }

  async findOne(options: FindManyOptions<Entity> = {}, currentUser?: User) {
    const preProcessedOptions = await this.preFindOne(options, currentUser);
    const data = await this.repository.findOne(preProcessedOptions);
    if (!data) {
      await this.onFindOneNotFound(options, currentUser);
    }
    return this.postFindOne(data, preProcessedOptions, currentUser);
  }

  async count(options: CustomFindManyOptions<Entity> = {}, currentUser?: User) {
    const preProcessedOptions = await this.preCount(options, currentUser);
    return this.repository.count(preProcessedOptions);
  }

  async createOne(userId: string, createDto: DeepPartial<Entity>, currentUser?: User) {
    const doc = await this.preCreateOne(userId, createDto, currentUser);
    const record = await this.repository.save(doc);
    return this.postCreateOne(record, createDto, currentUser);
  }

  async create(userId: string, createDtos: DeepPartial<Entity>[], currentUser?: User) {
    const docs = await this.preCreate(userId, createDtos, currentUser);
    const records = await this.repository.save(docs);
    return this.postCreate(records, createDtos, currentUser);
  }

  async update(
    currentUser: User,
    updateDto: DeepPartial<Entity>,
    options?: FindManyOptions<Entity>,
  ) {
    const oldRecords = (await this.find(options, currentUser))!.data;
    if (oldRecords.length === 0) {
      throw new NotFoundException('Record(s) not found!');
    }

    const doc = await this.preUpdate(currentUser, updateDto, oldRecords, options);
    await this.repository.save(
      oldRecords.map((record) => {
        const { updateTimestamp, ...recordData } = record;
        return {
          ...recordData,
          ...doc,
        } as DeepPartial<Entity>;
      }),
    );
    const newRecords = (await this.find(options, currentUser))!.data;
    return this.postUpdate(newRecords, oldRecords, updateDto, options, currentUser);
  }

  async softDelete(
    /**
     * The ID of the user who perform the delete operation
     */
    currentUser: User,
    options?: FindManyOptions<Entity>,
  ) {
    const records = (await this.find(options, currentUser))!.data;
    if (records.length === 0) {
      throw new NotFoundException('Record(s) not found!');
    }

    await this.preSoftDelete(currentUser, options);
    await this.repository.update(
      (options?.where ?? {}) as FindOptionsWhere<Entity>,
      {
        deleteUserId: currentUser.id,
        updateUserId: currentUser.id,
      } as unknown as QueryDeepPartialEntity<Entity>,
    );
    const deletedRecords = await this.repository.softRemove(records);
    return this.postSoftDelete(currentUser, deletedRecords, options);
  }

  async restore(currentUser: User, options?: FindManyOptions<Entity>) {
    const records = (await this.find(options, currentUser))!.data;
    if (records.length === 0) {
      throw new NotFoundException('Record(s) not found!');
    }

    await this.preRestore(currentUser, options);
    await this.repository.update(
      (options?.where ?? {}) as FindOptionsWhere<Entity>,
      {
        deleteUserId: null,
        updateUserId: currentUser.id,
      } as unknown as QueryDeepPartialEntity<Entity>,
    );
    const restoredRecords = await this.repository.recover(records);
    return this.postRestore(restoredRecords, currentUser, options);
  }

  /* ---------- Pre-processing functions ---------- */

  protected async preFind(
    options: CustomFindManyOptions<Entity>,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _currentUser?: User,
  ): Promise<CustomFindManyOptions<Entity>> {
    // TODO: Add WHERE, ORDER, LIMIT, OFFSET clause
    const { skip, take } = this.getPaginationProps(options);
    const order = this.getOrderProps(options);

    return {
      ...options,
      skip,
      take,
      order,
    };
  }

  protected async preFindOne(
    options: FindOneOptions<Entity>,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _currentUser?: User,
  ): Promise<FindOneOptions<Entity>> {
    return options;
  }

  protected async onFindOneNotFound(
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _options: FindOneOptions<Entity>,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _currentUser?: User,
  ) {}

  protected async preCount(
    options: CustomFindManyOptions<Entity>,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _currentUser?: User,
  ): Promise<CustomFindManyOptions<Entity>> {
    return options;
  }

  protected async preCreateOne(
    userId: string,
    createDto: any,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _currentUser?: User,
  ): Promise<DeepPartial<Entity>> {
    return {
      ...createDto,
      createUserId: userId,
      updateUserId: userId,
    };
  }

  protected async preCreate(
    userId: string,
    createDtos: any[],
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _currentUser?: User,
  ): Promise<DeepPartial<Entity>[]> {
    return createDtos.map((dto) => ({
      ...dto,
      createUserId: userId,
      updateUserId: userId,
    }));
  }

  protected async preUpdate(
    currentUser: User,
    updateDto: any,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _oldRecords: Entity[],
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _options?: FindManyOptions<Entity>,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
  ): Promise<QueryDeepPartialEntity<Entity>> {
    return {
      ...updateDto,
      updateUserId: currentUser.id,
    };
  }

  protected async preSoftDelete(
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _currentUser: User,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _options?: FindManyOptions<Entity>,
  ) {}

  protected async preRestore(
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _currentUser: User,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _options?: FindManyOptions<Entity>,
  ) {}

  /* ---------- Post-processing functions ---------- */

  protected async postFind(
    data: Entity[],
    options: CustomFindManyOptions<Entity>,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _currentUser?: User,
  ) {
    const { queryDto } = options;
    const { page, pageSize, order, ...filterKeys } = queryDto ?? {};

    return {
      data,
      metadata: {
        pagination: await this.getPaginationResponse(options),
        filters: filterKeys,
        order: (order ?? []).map((orderVal) => {
          const [field, direction] = orderVal.split(':');
          return { field, direction };
        }),
      },
    };
  }

  protected async postFindOne(
    data: Entity | null,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _options: FindOneOptions<Entity>,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _currentUser?: User,
  ) {
    return data;
  }

  protected async postCreateOne(
    record: Entity,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _createDto: any,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _currentUser?: User,
  ) {
    return record;
  }

  protected async postCreate(
    records: Entity[],
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _createDtos: any[],
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _currentUser?: User,
  ) {
    return records;
  }

  protected async postUpdate(
    newRecords: Entity[],
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _oldRecords: Entity[],
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _updateDto: any,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _options?: FindManyOptions<Entity>,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _currentUser?: User,
  ) {
    return newRecords;
  }

  protected async postSoftDelete(
    _currentUser: User,
    deletedRecords: Entity[],
    _options?: FindManyOptions<Entity> /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */,
  ) {
    return deletedRecords;
  }

  protected postRestore(
    restoredRecords: Entity[],
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _currentUser: User,
    _options?: FindManyOptions<Entity>,
  ) {
    return restoredRecords;
  }

  private getPaginationProps(options: CustomFindManyOptions<Entity>) {
    const { queryDto } = options;
    const page = queryDto?.page || 1;
    const take = queryDto?.pageSize || 10;
    const skip = (page - 1) * take;
    return {
      take,
      skip,
    };
  }

  private getOrderProps(
    options: CustomFindManyOptions<Entity>,
  ): FindOptionsOrder<Entity> | undefined {
    const { queryDto, order } = options;

    if (queryDto?.order) {
      return {
        ...order,
        ...Object.fromEntries(queryDto.order.map((o) => o.split(':'))),
      };
    }

    return order;
  }

  private async getPaginationResponse(
    options: CustomFindManyOptions<Entity>,
  ): Promise<PaginationDto> {
    const { queryDto } = options;
    const page = queryDto?.page || 1;
    const pageSize = queryDto?.pageSize || 10;
    try {
      const { take, skip, ...opts } = options;
      const total = await this.count(opts);
      const totalPage = Math.ceil(total / pageSize);

      return {
        currentPage: page,
        pageSize,
        total,
        totalPage,
        hasNextPage: page < totalPage,
        hasPreviousPage: page > 1,
      };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException((e as Error).message);
    }
  }
}
