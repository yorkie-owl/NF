import { createZodDto } from 'nestjs-zod';
import { UpdateProfileRequestSchema } from '@lin-shi/contracts';

export class UpdateProfileDto extends createZodDto(
  UpdateProfileRequestSchema,
) {}
