import { Body, Controller, Get, Post, Query, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { IngredientsService } from './ingredients.service';

const ByIdsBodySchema = z.object({
  ids: z.array(z.string().uuid()),
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

  @Post('ingredients/recognize')
  recognize() {
    return {
      recognized: [
        { name: '青椒', confidence: 0.92, tasteTags: ['清爽', '微辣'] },
        { name: '土豆', confidence: 0.88, tasteTags: ['淀粉', '饱腹'] },
      ],
    };
  }
}
