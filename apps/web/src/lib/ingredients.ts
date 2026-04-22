import { IngredientSchema, type Ingredient } from '@lin-shi/contracts';
import { z } from 'zod';
import { api } from './api';

const ListResponseSchema = z.object({
  items: z.array(IngredientSchema),
});

const RecognizedItemSchema = z.object({
  name: z.string(),
  confidence: z.number(),
  tasteTags: z.array(z.string()),
});

const RecognizeResponseSchema = z.object({
  recognized: z.array(RecognizedItemSchema),
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

export type RecognizedPreview = z.infer<typeof RecognizedItemSchema>;

export async function recognizeIngredientsFromImage(file: File) {
  const form = new FormData();
  form.append('file', file);
  const json: unknown = await api.post('ingredients/recognize', { body: form }).json();
  return RecognizeResponseSchema.parse(json).recognized;
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
