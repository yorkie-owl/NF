import { createZodDto } from 'nestjs-zod';
import { ListActivitiesQuerySchema } from '@lin-shi/contracts';

export class ListActivitiesDto extends createZodDto(
  ListActivitiesQuerySchema,
) {}
