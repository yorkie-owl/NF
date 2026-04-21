import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'a_activity_manual_ingredients' })
export class ActivityManualIngredientEntity {
  @PrimaryColumn({ name: 'activity_id', type: 'uuid' })
  activityId!: string;

  @PrimaryColumn({ name: 'name', type: 'varchar', length: 50 })
  name!: string;

  @Column({ name: 'added_by', type: 'uuid' })
  addedBy!: string;

  @CreateDateColumn({ name: 'added_at', type: 'timestamptz' })
  addedAt!: Date;
}
