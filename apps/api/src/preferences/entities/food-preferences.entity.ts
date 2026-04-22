import {
  Column,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import type {
  CookingSkill,
  Cuisine,
  DietaryRestriction,
} from '@lin-shi/contracts';

@Entity({ name: 'u_food_preferences' })
export class FoodPreferencesEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({
    name: 'cuisines',
    type: 'text',
    array: true,
    default: () => "'{}'",
  })
  cuisines!: Cuisine[];

  @Column({
    name: 'dietary_restrictions',
    type: 'text',
    array: true,
    default: () => "'{}'",
  })
  dietaryRestrictions!: DietaryRestriction[];

  @Column({
    name: 'cooking_skill',
    type: 'varchar',
    length: 20,
    default: 'BEGINNER',
  })
  cookingSkill!: CookingSkill;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
