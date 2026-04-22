import { z } from 'zod';

export const CurrentUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
});
export type CurrentUser = z.infer<typeof CurrentUserSchema>;
