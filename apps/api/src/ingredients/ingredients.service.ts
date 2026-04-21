import { Injectable } from '@nestjs/common';
import type { Ingredient } from '@lin-shi/contracts';

const DEMO_USER = '00000000-0000-4000-8000-000000000001';

/** Mock 数据：队友接入 `i_ingredients` 后可替换为 TypeORM。 */
@Injectable()
export class IngredientsService {
  private readonly mock: Ingredient[] = [
    {
      id: '10000000-0000-4000-8000-000000000001',
      userId: DEMO_USER,
      name: '番茄',
      category: '蔬菜',
      tasteTags: ['酸甜', '多汁'],
      recognizedFromImageUrl: null,
      addedAt: new Date(Date.now() - 86400000).toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    },
    {
      id: '10000000-0000-4000-8000-000000000002',
      userId: DEMO_USER,
      name: '鸡蛋',
      category: '蛋奶',
      tasteTags: ['高蛋白'],
      recognizedFromImageUrl: null,
      addedAt: new Date(Date.now() - 172800000).toISOString(),
      expiresAt: new Date(Date.now() + 432000000).toISOString(),
    },
    {
      id: '10000000-0000-4000-8000-000000000003',
      userId: DEMO_USER,
      name: '牛奶',
      category: '饮品',
      tasteTags: ['乳香'],
      recognizedFromImageUrl: null,
      addedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    },
  ];

  listByUser(userId: string): Ingredient[] {
    return this.mock.filter((i) => i.userId === userId);
  }

  getByIds(ids: string[]): Ingredient[] {
    const set = new Set(ids);
    return this.mock.filter((i) => set.has(i.id));
  }

  getDemoUserId(): string {
    return DEMO_USER;
  }
}
