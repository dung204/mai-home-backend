import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { BaseEntity } from '@/base/entities';
import { User } from '@/modules/users/entities/user.entity';

@Entity({
  schema: 'public',
  name: 'transactions',
})
export class Transaction extends BaseEntity {
  @PrimaryColumn('varchar')
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @Column('int')
  amount!: number;
}
