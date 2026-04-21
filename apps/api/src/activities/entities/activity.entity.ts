import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type {
  ActivityJoinScope,
  ActivityStatus,
} from '@lin-shi/contracts';

@Entity({ name: 'a_activities' })
export class ActivityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'title', type: 'varchar', length: 80 })
  title!: string;

  @Column({ name: 'description', type: 'varchar', length: 500, nullable: true })
  description!: string | null;

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime!: Date;

  @Column({ name: 'location', type: 'varchar', length: 200 })
  location!: string;

  @Column({ name: 'max_participants', type: 'integer' })
  maxParticipants!: number;

  @Column({ name: 'join_scope', type: 'varchar', length: 30 })
  joinScope!: ActivityJoinScope;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 30,
    default: 'WAITING_FOR_MEMBERS',
  })
  status!: ActivityStatus;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @Column({ name: 'chat_room_id', type: 'uuid', nullable: true })
  chatRoomId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt!: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;
}
