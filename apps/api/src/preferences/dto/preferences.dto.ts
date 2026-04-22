import { createZodDto } from 'nestjs-zod';
import {
  FoodPreferencesSchema,
  FriendPreferencesSchema,
} from '@lin-shi/contracts';

export class FriendPreferencesDto extends createZodDto(
  FriendPreferencesSchema,
) {}

export class FoodPreferencesDto extends createZodDto(FoodPreferencesSchema) {}
