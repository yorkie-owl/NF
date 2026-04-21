import { createZodDto } from 'nestjs-zod';
import {
  LoginRequestSchema,
  RefreshRequestSchema,
  RegisterRequestSchema,
} from '@lin-shi/contracts';

export class RegisterDto extends createZodDto(RegisterRequestSchema) {}
export class LoginDto extends createZodDto(LoginRequestSchema) {}
export class RefreshDto extends createZodDto(RefreshRequestSchema) {}
