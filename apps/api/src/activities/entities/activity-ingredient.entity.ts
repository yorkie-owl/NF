import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'a_activity_ingredients' })
export class ActivityIngredientEntity {
  @PrimaryColumn({ name: 'activity_id', type: 'uuid' })
  activityId!: string;

  @PrimaryColumn({ name: 'ingredient_id', type: 'uuid' })
  ingredientId!: string;

  @Column({ name: 'added_by', type: 'uuid' })
  addedBy!: string;

  @CreateDateColumn({ name: 'added_at', type: 'timestamptz' })
  addedAt!: Date;
}
