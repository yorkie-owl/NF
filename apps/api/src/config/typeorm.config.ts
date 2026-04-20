import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import type { Env } from './env.schema';

/**
 * Factory for NestJS TypeOrmModule.forRootAsync.
 * Uses ConfigService to build options from validated env.
 */
export const dataSourceOptions = (
  config: ConfigService<Env, true>,
): DataSourceOptions => ({
  type: 'postgres',
  host: config.getOrThrow<string>('DB_HOST'),
  port: config.getOrThrow<number>('DB_PORT'),
  username: config.getOrThrow<string>('DB_USER'),
  password: config.getOrThrow<string>('DB_PASSWORD'),
  database: config.getOrThrow<string>('DB_NAME'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
  synchronize: false,
  logging:
    config.get<string>('NODE_ENV') === 'development' ? ['error'] : false,
});
