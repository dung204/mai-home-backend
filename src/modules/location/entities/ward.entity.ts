import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { BaseEntity } from '@/base/entities';

import { District } from './district.entity';

@Entity({
  schema: 'public',
  name: 'wards',
})
export class Ward extends BaseEntity {
  @PrimaryColumn('varchar')
  id!: string;

  @ManyToOne(() => District)
  district!: District;

  @Column('varchar')
  name!: string;
}
