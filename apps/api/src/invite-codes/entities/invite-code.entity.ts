import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'u_invite_codes' })
export class InviteCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'owner_id', type: 'uuid', unique: true })
  ownerId!: string;

  @Column({ name: 'code', type: 'varchar', length: 10, unique: true })
  code!: string;

  @Column({ name: 'max_uses', type: 'integer', default: 3 })
  maxUses!: number;

  @Column({ name: 'uses_remaining', type: 'integer', default: 3 })
  usesRemaining!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
