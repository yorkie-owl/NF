import {
  Body,
  Controller,
  Delete,
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
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ListActivitiesDto } from './dto/list-activities.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activities: ActivitiesService) {}

  @Post()
  create(
    @CurrentUser() me: CurrentUserType,
    @Body() body: CreateActivityDto,
  ) {
    return this.activities.create(me.id, body);
  }

  @Get()
  list(
    @CurrentUser() me: CurrentUserType,
    @Query() query: ListActivitiesDto,
  ) {
    return this.activities.list(me.id, query);
  }

  @Get(':id')
  detail(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.activities.getDetail(id);
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  join(
    @CurrentUser() me: CurrentUserType,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.activities.join(me.id, id);
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  leave(
    @CurrentUser() me: CurrentUserType,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.activities.leave(me.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancel(
    @CurrentUser() me: CurrentUserType,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.activities.cancel(me.id, id);
  }
}
