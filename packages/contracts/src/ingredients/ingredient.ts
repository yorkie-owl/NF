import { z } from 'zod';

export const IngredientSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1),
  category: z.string().nullable(),
  tasteTags: z.array(z.string()),
  /** 场景 / 对方背景等（如：湖南菜、本科生） */
  contextTags: z.array(z.string()),
  recognizedFromImageUrl: z.string().url().nullable(),
  addedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});
export type Ingredient = z.infer<typeof IngredientSchema>;

export const UpdateIngredientBodySchema = z
  .object({
    tasteTags: z.array(z.string()).optional(),
    contextTags: z.array(z.string()).optional(),
  })
  .refine((b) => b.tasteTags !== undefined || b.contextTags !== undefined, {
    message: 'tasteTags or contextTags required',
  });
export type UpdateIngredientBody = z.infer<typeof UpdateIngredientBodySchema>;

export interface IngredientsClient {
  listByUser(userId: string): Promise<Ingredient[]>;
  getByIds(ids: string[]): Promise<Ingredient[]>;
}
