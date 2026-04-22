import {
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'u_user_badges' })
@Index(['userId'])
export class UserBadgeEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @PrimaryColumn({ name: 'badge_code', type: 'varchar', length: 32 })
  badgeCode!: string;

  @CreateDateColumn({ name: 'earned_at', type: 'timestamptz' })
  earnedAt!: Date;
}
