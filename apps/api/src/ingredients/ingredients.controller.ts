import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { z } from 'zod';
import { IngredientsService } from './ingredients.service';

const ByIdsBodySchema = z.object({
  ids: z.array(z.string().uuid()),
});

const CreateIngredientBodySchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1),
  category: z.string().nullable().optional().default(null),
  tasteTags: z.array(z.string()).default([]),
  recognizedFromImageUrl: z.string().url().nullable().optional().default(null),
});

@Controller()
export class IngredientsController {
  constructor(
    private readonly ingredients: IngredientsService,
    private readonly config: ConfigService,
  ) {}

  @Get('ingredients')
  list(@Query('userId') userId: string | undefined) {
    const bypass = this.config.get<boolean>('INGREDIENTS_DEV_BYPASS_AUTH');
    const uid = userId ?? (bypass ? this.ingredients.getDemoUserId() : undefined);
    if (!uid) {
      throw new UnauthorizedException('userId required');
    }
    return { items: this.ingredients.listByUser(uid) };
  }

  /** 契约 §7.1：`POST /ingredients:byIds` — 此处用 `/ingredients/by-ids` 避免路由歧义 */
  @Post('ingredients/by-ids')
  byIds(@Body() body: unknown) {
    const { ids } = ByIdsBodySchema.parse(body);
    return { items: this.ingredients.getByIds(ids) };
  }

  /** 契约 §7.1：multipart 字段名 `file` */
  @Post('ingredients/recognize')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 12 * 1024 * 1024 },
    }),
  )
  async recognize(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file?.size) {
      throw new BadRequestException('file required (multipart field: file)');
    }
    return this.ingredients.recognizeFromUpload(file);
  }

  /** 将识别结果写入 mock 食材列表（与 DEMO_USER 流程一致；队友接库后替换为持久化） */
  @Post('ingredients')
  create(@Body() body: unknown) {
    const parsed = CreateIngredientBodySchema.parse(body);
    return { item: this.ingredients.addIngredient(parsed) };
  }
}
