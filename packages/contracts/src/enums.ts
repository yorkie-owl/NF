import { z } from 'zod';

export const CuisineEnum = z.enum([
  'SICHUAN',
  'CANTONESE',
  'JIANGSU',
  'ZHEJIANG',
  'SHANDONG',
  'FUJIAN',
  'HUNAN',
  'ANHUI',
  'NORTHEASTERN',
  'XINJIANG',
  'JAPANESE',
  'KOREAN',
  'THAI',
  'VIETNAMESE',
  'ITALIAN',
  'FRENCH',
  'AMERICAN',
  'MEXICAN',
  'INDIAN',
  'MIDDLE_EASTERN',
]);
export type Cuisine = z.infer<typeof CuisineEnum>;

export const DietaryRestrictionEnum = z.enum([
  'VEGETARIAN',
  'VEGAN',
  'HALAL',
  'KOSHER',
  'GLUTEN_FREE',
  'LACTOSE_FREE',
  'NUT_FREE',
  'SEAFOOD_FREE',
  'LOW_SPICE',
  'LOW_SODIUM',
]);
export type DietaryRestriction = z.infer<typeof DietaryRestrictionEnum>;

export const CookingSkillEnum = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']);
export type CookingSkill = z.infer<typeof CookingSkillEnum>;

export const ActivityStatusEnum = z.enum([
  'WAITING_FOR_MEMBERS',
  'FORMED',
  'STARTING_SOON',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
]);
export type ActivityStatus = z.infer<typeof ActivityStatusEnum>;

export const ActivityJoinScopeEnum = z.enum([
  'ACQUAINTANCES_ONLY',
  'STRANGERS_OK',
  'HIGH_TRUST_ONLY',
]);
export type ActivityJoinScope = z.infer<typeof ActivityJoinScopeEnum>;

export const ActivityEventTypeEnum = z.enum([
  'CREATED',
  'JOINED',
  'LEFT',
  'FORMED',
  'STATUS_CHANGED',
  'INGREDIENT_ADDED',
  'INGREDIENT_REMOVED',
  'CANCELLED',
  'COMPLETED',
]);
export type ActivityEventType = z.infer<typeof ActivityEventTypeEnum>;
