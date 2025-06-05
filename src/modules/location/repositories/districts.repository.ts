import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { District } from '../entities/district.entity';

@Injectable()
export class DistrictsRepository extends Repository<District> {
  constructor(private dataSource: DataSource) {
    super(District, dataSource.createEntityManager());
  }
}
