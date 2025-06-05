import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '@/base/entities';
import { City } from '@/modules/location/entities/city.entity';
import { District } from '@/modules/location/entities/district.entity';
import { Ward } from '@/modules/location/entities/ward.entity';
import { User } from '@/modules/users/entities/user.entity';

import { PropertyCategory } from '../enums/property-category.enum';

@Entity({
  schema: 'public',
  name: 'properties',
})
export class Property extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 100 })
  title!: string;

  @Column('text')
  description!: string;

  @ManyToOne(() => User)
  owner!: User;

  @Column('enum', { enum: PropertyCategory, enumName: 'PropertyCategory' })
  category!: PropertyCategory;

  @Column('varchar')
  cityId!: string;

  @Column('varchar')
  districtId!: string;

  @Column('varchar')
  wardId!: string;

  @Column('varchar')
  address!: string;

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: string | null = null;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: string | null = null;

  @Column('decimal', { precision: 15, scale: 2 })
  pricePerMonth!: string;

  @Column('decimal', { precision: 6, scale: 2 })
  area!: string;

  @Column('text', { array: true, default: [] })
  images: string[] = [];

  @Column('text', { array: true, default: [] })
  videos: string[] = [];

  @ManyToOne(() => City)
  city!: City;

  @ManyToOne(() => District)
  district!: District;

  @ManyToOne(() => Ward)
  ward!: Ward;
}
