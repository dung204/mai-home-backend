import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '@/base/entities';
import { Account } from '@/modules/auth/entities/account.entity';

@Entity({
  schema: 'public',
  name: 'users',
})
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Account, (account) => account.id, {
    cascade: true,
  })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @Column('varchar', { length: 128, nullable: true })
  displayName: string | null = null;

  @Column('text', { nullable: true })
  avatar: string | null = null;
}
