import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  FoodPreferences,
  FriendPreferences,
} from '@lin-shi/contracts';
import { FriendPreferencesEntity } from './entities/friend-preferences.entity';
import { FoodPreferencesEntity } from './entities/food-preferences.entity';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectRepository(FriendPreferencesEntity)
    private readonly friend: Repository<FriendPreferencesEntity>,
    @InjectRepository(FoodPreferencesEntity)
    private readonly food: Repository<FoodPreferencesEntity>,
  ) {}

  async getFriend(userId: string): Promise<FriendPreferences> {
    const row = await this.ensureFriend(userId);
    return {
      acceptStrangers: row.acceptStrangers,
      distanceKm: row.distanceKm,
      timeSlots: row.timeSlots,
    };
  }

  async putFriend(
    userId: string,
    prefs: FriendPreferences,
  ): Promise<FriendPreferences> {
    await this.ensureFriend(userId);
    await this.friend.update(
      { userId },
      {
        acceptStrangers: prefs.acceptStrangers,
        distanceKm: prefs.distanceKm,
        timeSlots: prefs.timeSlots,
      },
    );
    return this.getFriend(userId);
  }

  async getFood(userId: string): Promise<FoodPreferences> {
    const row = await this.ensureFood(userId);
    return {
      cuisines: row.cuisines,
      dietaryRestrictions: row.dietaryRestrictions,
      cookingSkill: row.cookingSkill,
    };
  }

  async putFood(
    userId: string,
    prefs: FoodPreferences,
  ): Promise<FoodPreferences> {
    await this.ensureFood(userId);
    await this.food.update(
      { userId },
      {
        cuisines: prefs.cuisines,
        dietaryRestrictions: prefs.dietaryRestrictions,
        cookingSkill: prefs.cookingSkill,
      },
    );
    return this.getFood(userId);
  }

  private async ensureFriend(
    userId: string,
  ): Promise<FriendPreferencesEntity> {
    const existing = await this.friend.findOne({ where: { userId } });
    if (existing) return existing;
    return this.friend.save(
      this.friend.create({
        userId,
        acceptStrangers: false,
        distanceKm: 5,
        timeSlots: [],
      }),
    );
  }

  private async ensureFood(userId: string): Promise<FoodPreferencesEntity> {
    const existing = await this.food.findOne({ where: { userId } });
    if (existing) return existing;
    return this.food.save(
      this.food.create({
        userId,
        cuisines: [],
        dietaryRestrictions: [],
        cookingSkill: 'BEGINNER',
      }),
    );
  }
}
