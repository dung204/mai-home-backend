import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Property } from '../entities/property.entity';

@Injectable()
export class PropertiesRepository extends Repository<Property> {
  constructor(private dataSource: DataSource) {
    super(Property, dataSource.createEntityManager());
  }
}
