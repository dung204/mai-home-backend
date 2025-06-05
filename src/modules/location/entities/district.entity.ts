import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { BaseEntity } from '@/base/entities';

import { City } from './city.entity';

@Entity({
  schema: 'public',
  name: 'districts',
})
export class District extends BaseEntity {
  @PrimaryColumn('varchar')
  id!: string;

  @ManyToOne(() => City)
  city!: City;

  @Column('varchar')
  name!: string;
}
