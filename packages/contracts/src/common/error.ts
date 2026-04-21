import { z } from 'zod';

export const ApiErrorSchema = z.object({
  statusCode: z.number().int(),
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  requestId: z.string().optional(),
  timestamp: z.string().datetime(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
