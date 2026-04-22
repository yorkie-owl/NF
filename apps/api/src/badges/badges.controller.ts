import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { CurrentUser as CurrentUserType } from '@lin-shi/contracts';
import { BadgesService } from './badges.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('badges')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class BadgesController {
  constructor(private readonly badges: BadgesService) {}

  @Get('badges')
  list() {
    return this.badges.listAll();
  }

  @Get('me/badges')
  listForMe(@CurrentUser() me: CurrentUserType) {
    return this.badges.listForUser(me.id);
  }
}
