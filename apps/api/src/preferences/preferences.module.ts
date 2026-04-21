import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendPreferencesEntity } from './entities/friend-preferences.entity';
import { FoodPreferencesEntity } from './entities/food-preferences.entity';
import { PreferencesService } from './preferences.service';
import { PreferencesController } from './preferences.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FriendPreferencesEntity,
      FoodPreferencesEntity,
    ]),
  ],
  controllers: [PreferencesController],
  providers: [PreferencesService],
  exports: [PreferencesService],
})
export class PreferencesModule {}
