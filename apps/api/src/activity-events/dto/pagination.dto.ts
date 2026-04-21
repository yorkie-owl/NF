import { createZodDto } from 'nestjs-zod';
import { PaginationQuerySchema } from '@lin-shi/contracts';

export class PaginationDto extends createZodDto(PaginationQuerySchema) {}
