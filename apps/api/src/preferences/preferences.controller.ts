import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { CurrentUser as CurrentUserType } from '@lin-shi/contracts';
import { PreferencesService } from './preferences.service';
import {
  FoodPreferencesDto,
  FriendPreferencesDto,
} from './dto/preferences.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('preferences')
@ApiBearerAuth()
@Controller('me/preferences')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  constructor(private readonly prefs: PreferencesService) {}

  @Get('friend')
  getFriend(@CurrentUser() me: CurrentUserType) {
    return this.prefs.getFriend(me.id);
  }

  @Put('friend')
  putFriend(
    @CurrentUser() me: CurrentUserType,
    @Body() body: FriendPreferencesDto,
  ) {
    return this.prefs.putFriend(me.id, body);
  }

  @Get('food')
  getFood(@CurrentUser() me: CurrentUserType) {
    return this.prefs.getFood(me.id);
  }

  @Put('food')
  putFood(
    @CurrentUser() me: CurrentUserType,
    @Body() body: FoodPreferencesDto,
  ) {
    return this.prefs.putFood(me.id, body);
  }
}
