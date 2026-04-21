import { createZodDto } from 'nestjs-zod';
import { ListActivityFeedsQuerySchema } from '@lin-shi/contracts';

export class ListActivityFeedsDto extends createZodDto(
  ListActivityFeedsQuerySchema,
) {}
