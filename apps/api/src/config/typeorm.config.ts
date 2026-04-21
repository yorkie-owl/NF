import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import type { Env } from './env.schema';

/**
 * Factory for NestJS TypeOrmModule.forRootAsync.
 * Uses ConfigService to build options from validated env.
 *
 * Entity/migration globs are keyed off `__filename`'s extension so dev
 * (ts-node/ts-loader) loads `.ts` while production (compiled dist) loads
 * `.js` — mixing both at runtime crashes on Node 22 ESM interop.
 */
export const dataSourceOptions = (
  config: ConfigService<Env, true>,
): DataSourceOptions => {
  const isCompiled = __filename.endsWith('.js');
  const ext = isCompiled ? 'js' : 'ts';
  return {
    type: 'postgres',
    host: config.getOrThrow<string>('DB_HOST'),
    port: config.getOrThrow<number>('DB_PORT'),
    username: config.getOrThrow<string>('DB_USER'),
    password: config.getOrThrow<string>('DB_PASSWORD'),
    database: config.getOrThrow<string>('DB_NAME'),
    entities: [__dirname + `/../**/*.entity.${ext}`],
    // Migrations are run via the CLI (`migration:run`), not at runtime.
    migrations: [],
    synchronize: false,
    logging:
      config.get<string>('NODE_ENV') === 'development' ? ['error'] : false,
  };
};
