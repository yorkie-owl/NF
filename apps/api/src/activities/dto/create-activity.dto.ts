import { createZodDto } from 'nestjs-zod';
import { CreateActivityRequestSchema } from '@lin-shi/contracts';

export class CreateActivityDto extends createZodDto(
  CreateActivityRequestSchema,
) {}
