import { z } from 'zod';

export const BadgeDefinitionSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  iconUrl: z.string().url().nullable(),
});
export type BadgeDefinition = z.infer<typeof BadgeDefinitionSchema>;
