import { Injectable } from '@nestjs/common';

export interface IngredientDto {
  id: string;
  userId: string;
  name: string;
  category: string | null;
  tasteTags: string[];
  recognizedFromImageUrl: string | null;
  addedAt: string;
  expiresAt: string;
}

export interface IngredientsClient {
  listByUser(userId: string): Promise<IngredientDto[]>;
  getByIds(ids: string[]): Promise<IngredientDto[]>;
}

export const INGREDIENTS_CLIENT = Symbol('IngredientsClient');

@Injectable()
export class MockIngredientsClient implements IngredientsClient {
  async listByUser(_userId: string): Promise<IngredientDto[]> {
    return [];
  }
  async getByIds(_ids: string[]): Promise<IngredientDto[]> {
    return [];
  }
}
