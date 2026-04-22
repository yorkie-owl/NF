import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { CurrentUser as CurrentUserType } from '@lin-shi/contracts';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface UploadedMulterFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
}

@ApiTags('users')
@Controller()
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() me: CurrentUserType) {
    return this.users.getMe(me.id);
  }

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  updateMe(
    @CurrentUser() me: CurrentUserType,
    @Body() body: UpdateProfileDto,
  ) {
    return this.users.updateProfile(me.id, body);
  }

  @Post('me/avatar')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @CurrentUser() me: CurrentUserType,
    @UploadedFile() file: UploadedMulterFile | undefined,
  ) {
    if (!file) {
      throw new Error('Avatar file missing');
    }
    return this.users.uploadAvatar(me.id, {
      buffer: file.buffer,
      mimetype: file.mimetype,
      size: file.size,
    });
  }

  @Get('users/:id/public')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getPublic(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.users.getPublicUser(id);
  }
}
