import {
  Column,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { TimeSlot } from '@lin-shi/contracts';

@Entity({ name: 'u_friend_preferences' })
export class FriendPreferencesEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'accept_strangers', type: 'boolean', default: false })
  acceptStrangers!: boolean;

  @Column({ name: 'distance_km', type: 'integer', default: 5 })
  distanceKm!: number;

  @Column({ name: 'time_slots', type: 'jsonb', default: () => "'[]'::jsonb" })
  timeSlots!: TimeSlot[];

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
