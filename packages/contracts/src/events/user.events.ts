import { z } from 'zod';

export const USER_EVENTS = {
  REGISTERED: 'user.registered',
} as const;

export const UserRegisteredEventSchema = z.object({
  userId: z.string().uuid(),
  registeredAt: z.string().datetime(),
});
export type UserRegisteredEvent = z.infer<typeof UserRegisteredEventSchema>;
