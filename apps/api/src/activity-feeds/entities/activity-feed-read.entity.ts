import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'a_activity_feed_reads' })
export class ActivityFeedReadEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @PrimaryColumn({ name: 'activity_id', type: 'uuid' })
  activityId!: string;

  @Column({ name: 'last_read_at', type: 'timestamptz' })
  lastReadAt!: Date;
}
