import type { Ingredient } from '@lin-shi/contracts';

/**
 * 把"食材"重新解读为 OPC idea 卡——躁动指数 0..100。
 * - 0 表示刚上架；100 表示已超期，必须出走。
 */
export function restlessness(ing: Pick<Ingredient, 'addedAt' | 'expiresAt'>): number {
  const added = new Date(ing.addedAt).getTime();
  const expires = new Date(ing.expiresAt).getTime();
  const span = expires - added;
  if (span <= 0) return 100;
  const elapsed = Date.now() - added;
  if (elapsed <= 0) return 0;
  if (elapsed >= span) return 100;
  return Math.round((elapsed / span) * 100);
}

export function isRestless(ing: Pick<Ingredient, 'addedAt' | 'expiresAt'>): boolean {
  return restlessness(ing) >= 95;
}
