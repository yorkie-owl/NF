import { IngredientSchema, type Ingredient } from '@lin-shi/contracts';
import { z } from 'zod';
import { api } from './api';

export { recognizeIngredientsFromImage, type RecognizedPreview } from './ingredients-recognize';

const ListResponseSchema = z.object({
  items: z.array(IngredientSchema),
});

const CreateIngredientResponseSchema = z.object({
  item: IngredientSchema,
});

const DEMO_USER = '00000000-0000-4000-8000-000000000001';

export async function fetchIngredients(): Promise<Ingredient[]> {
  const json = await api
    .get('ingredients', {
      searchParams: { userId: DEMO_USER },
      cache: 'no-store',
    })
    .json();
  return ListResponseSchema.parse(json).items;
}

export async function fetchIngredientById(id: string): Promise<Ingredient | undefined> {
  const items = await fetchIngredients();
  return items.find((i) => i.id === id);
}

export async function createIngredientOnServer(input: {
  name: string;
  category?: string | null;
  tasteTags: string[];
  recognizedFromImageUrl?: string | null;
}): Promise<Ingredient> {
  const json: unknown = await api
    .post('ingredients', {
      json: {
        userId: DEMO_USER,
        name: input.name,
        category: input.category ?? null,
        tasteTags: input.tasteTags,
        recognizedFromImageUrl: input.recognizedFromImageUrl ?? null,
      },
    })
    .json();
  return CreateIngredientResponseSchema.parse(json).item;
}
