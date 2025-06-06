import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Review } from '../entities/reviews.entity';

@Injectable()
export class ReviewsRepository extends Repository<Review> {
  constructor(private dataSource: DataSource) {
    super(Review, dataSource.createEntityManager());
  }
}
