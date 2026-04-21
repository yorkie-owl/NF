import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserBadgeEntity } from '../badges/entities/user-badge.entity';
import { FriendPreferencesEntity } from '../preferences/entities/friend-preferences.entity';
import { FoodPreferencesEntity } from '../preferences/entities/food-preferences.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { InviteCodesModule } from '../invite-codes/invite-codes.module';
import { ExternalModule } from '../external/external.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserBadgeEntity,
      FriendPreferencesEntity,
      FoodPreferencesEntity,
    ]),
    InviteCodesModule,
    ExternalModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
