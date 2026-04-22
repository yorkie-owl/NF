import { z } from 'zod';

export const IngredientSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1),
  category: z.string().nullable(),
  tasteTags: z.array(z.string()),
  recognizedFromImageUrl: z.string().url().nullable(),
  addedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});
export type Ingredient = z.infer<typeof IngredientSchema>;

export interface IngredientsClient {
  listByUser(userId: string): Promise<Ingredient[]>;
  getByIds(ids: string[]): Promise<Ingredient[]>;
}
