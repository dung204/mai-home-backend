import { Column, Entity, PrimaryColumn } from 'typeorm';

import { BaseEntity } from '@/base/entities';

@Entity({
  schema: 'public',
  name: 'cities',
})
export class City extends BaseEntity {
  @PrimaryColumn('varchar')
  id!: string;

  @Column('varchar')
  name!: string;
}
