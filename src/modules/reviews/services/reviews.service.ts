import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DeepPartial, FindOneOptions, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

import { BaseService, CustomFindManyOptions } from '@/base/services';
import { User } from '@/modules/users/entities/user.entity';

import { CreateReviewDto, ReviewQueryDto } from '../dtos/reviews.dtos';
import { Review } from '../entities/reviews.entity';
import { ReviewsRepository } from '../repositories/reviews.repository';

@Injectable()
export class ReviewsService extends BaseService<Review> {
  constructor(protected readonly repository: ReviewsRepository) {
    const logger = new Logger(ReviewsService.name);
    super(repository, logger);
  }

  protected async preFind(
    options: CustomFindManyOptions<Review>,
    _currentUser?: User,
  ): Promise<CustomFindManyOptions<Review>> {
    const preProcessedOptions = await super.preFind(options, _currentUser);

    if (preProcessedOptions.queryDto) {
      const { maxStars, minStars } = preProcessedOptions.queryDto as ReviewQueryDto;

      preProcessedOptions.where = {
        ...preProcessedOptions.where,
        ...(minStars && { stars: MoreThanOrEqual(minStars) }),
        ...(maxStars && { stars: LessThanOrEqual(maxStars) }),
      };
    }

    return {
      ...preProcessedOptions,
      relations: {
        user: {
          account: true,
        },
      },
    };
  }

  protected async preFindOne(
    options: FindOneOptions<Review>,
    _currentUser?: User,
  ): Promise<FindOneOptions<Review>> {
    const preProcessedOptions = await super.preFindOne(options, _currentUser);

    return {
      ...preProcessedOptions,
      relations: {
        user: {
          account: true,
        },
      },
    };
  }

  protected async onFindOneNotFound(_options: FindOneOptions<Review>, _currentUser?: User) {
    throw new NotFoundException('Review not found.');
  }

  protected async preCreateOne(
    userId: string,
    createDto: CreateReviewDto,
  ): Promise<DeepPartial<Review>> {
    const { propertyId } = createDto;

    const reviewExisted = await this.repository.existsBy({
      userId,
      propertyId,
    });

    if (reviewExisted) {
      throw new ConflictException('A review for this property has existed.');
    }

    return createDto;
  }
}
