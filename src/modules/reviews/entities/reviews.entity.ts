import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { BaseEntity } from '@/base/entities';
import { Property } from '@/modules/properties/entities/property.entity';
import { User } from '@/modules/users/entities/user.entity';

@Entity({
  schema: 'public',
  name: 'reviews',
})
export class Review extends BaseEntity {
  @PrimaryColumn('uuid')
  userId!: string;

  @PrimaryColumn('uuid')
  propertyId!: string;

  @Column('int')
  stars!: number;

  @Column('text')
  content!: string;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Property)
  property!: Property;
}
