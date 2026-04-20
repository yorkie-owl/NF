/**
 * TypeORM CLI DataSource.
 *
 * Used by `typeorm-ts-node-commonjs` (migration:generate / migration:run).
 * The CLI does not go through Nest DI, so we read env directly here.
 *
 * We deliberately do not add `dotenv` as a direct dependency — instead we
 * parse `.env` ourselves to stay within the approved dependency list.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DataSource } from 'typeorm';

function loadDotenvIfPresent(): void {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq < 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadDotenvIfPresent();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

const cliPort = Number.parseInt(requireEnv('DB_PORT'), 10);
if (!Number.isFinite(cliPort) || cliPort <= 0) {
  throw new Error(
    `DB_PORT must be a positive integer, got: ${process.env['DB_PORT'] ?? ''}`,
  );
}

const cliDataSource = new DataSource({
  type: 'postgres',
  host: requireEnv('DB_HOST'),
  port: cliPort,
  username: requireEnv('DB_USER'),
  password: requireEnv('DB_PASSWORD'),
  database: requireEnv('DB_NAME'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
  synchronize: false,
});

export default cliDataSource;
