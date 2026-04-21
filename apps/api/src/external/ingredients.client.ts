import { Injectable } from '@nestjs/common';
import type {
  Ingredient,
  IngredientsClient as ContractIngredientsClient,
} from '@lin-shi/contracts';

export type IngredientsClient = ContractIngredientsClient;

export const INGREDIENTS_CLIENT = Symbol('IngredientsClient');

@Injectable()
export class MockIngredientsClient implements IngredientsClient {
  async listByUser(_userId: string): Promise<Ingredient[]> {
    return [];
  }
  async getByIds(_ids: string[]): Promise<Ingredient[]> {
    return [];
  }
}
