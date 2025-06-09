import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '@/base/entities';

import { Role } from '../enums/role.enum';

@Entity({
  schema: 'public',
  name: 'accounts',
})
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 12, unique: true, nullable: true })
  phone: string | null = null;

  @Column('varchar', { length: 256, unique: true, nullable: true })
  email: string | null = null;

  @Column('enum', { enum: Role, enumName: 'Role', default: Role.USER })
  role: Role = Role.USER;

  @Column('varchar', { nullable: true })
  googleId: string | null = null;
}
