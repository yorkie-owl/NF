import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'u_invite_redemptions' })
@Index(['codeId'])
export class InviteRedemptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'code_id', type: 'uuid' })
  codeId!: string;

  @Column({ name: 'redeemed_by', type: 'uuid', unique: true })
  redeemedBy!: string;

  @CreateDateColumn({ name: 'redeemed_at', type: 'timestamptz' })
  redeemedAt!: Date;
}
