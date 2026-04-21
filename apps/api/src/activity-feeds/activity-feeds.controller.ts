import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { CurrentUser as CurrentUserType } from '@lin-shi/contracts';
import { ActivityFeedsService } from './activity-feeds.service';
import { ListActivityFeedsDto } from './dto/list-feeds.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('activity-feeds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activity-feeds')
export class ActivityFeedsController {
  constructor(private readonly feeds: ActivityFeedsService) {}

  @Get()
  list(
    @CurrentUser() me: CurrentUserType,
    @Query() query: ListActivityFeedsDto,
  ) {
    return this.feeds.list(me.id, query);
  }

  @Post(':activityId/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markRead(
    @CurrentUser() me: CurrentUserType,
    @Param('activityId', new ParseUUIDPipe()) activityId: string,
  ): Promise<void> {
    await this.feeds.markRead(me.id, activityId);
  }
}
