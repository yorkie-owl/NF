import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { CurrentUser as CurrentUserType } from '@lin-shi/contracts';
import { InviteCodesService } from './invite-codes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('invite-codes')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class InviteCodesController {
  constructor(private readonly inviteCodes: InviteCodesService) {}

  @Get('me/invite-code')
  getMyInviteCode(@CurrentUser() me: CurrentUserType) {
    return this.inviteCodes.getMyCodeDetail(me.id);
  }
}
