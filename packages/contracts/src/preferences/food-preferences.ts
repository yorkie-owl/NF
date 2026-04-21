import { z } from 'zod';
import {
  CookingSkillEnum,
  CuisineEnum,
  DietaryRestrictionEnum,
} from '../enums';

export const FoodPreferencesSchema = z.object({
  cuisines: z.array(CuisineEnum).max(10),
  dietaryRestrictions: z.array(DietaryRestrictionEnum).max(10),
  cookingSkill: CookingSkillEnum,
});
export type FoodPreferences = z.infer<typeof FoodPreferencesSchema>;
