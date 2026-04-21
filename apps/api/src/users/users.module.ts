import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserBadgeEntity } from '../badges/entities/user-badge.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { InviteCodesModule } from '../invite-codes/invite-codes.module';
import { ExternalModule } from '../external/external.module';
import { PreferencesModule } from '../preferences/preferences.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserBadgeEntity]),
    InviteCodesModule,
    ExternalModule,
    PreferencesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
