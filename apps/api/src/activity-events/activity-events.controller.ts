import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ActivityEventsService } from './activity-events.service';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivityEventsController {
  constructor(private readonly events: ActivityEventsService) {}

  @Get(':id/events')
  list(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query: PaginationDto,
  ) {
    return this.events.list(id, query);
  }
}
