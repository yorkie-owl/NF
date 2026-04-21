import * as path from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { LoggerModule } from 'nestjs-pino';
import { AppConfigModule } from './config/config.module';
import { dataSourceOptions } from './config/typeorm.config';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PreferencesModule } from './preferences/preferences.module';
import { InviteCodesModule } from './invite-codes/invite-codes.module';
import { BadgesModule } from './badges/badges.module';
import { ExternalModule } from './external/external.module';
import type { Env } from './config/env.schema';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const isDev = config.get<string>('NODE_ENV') === 'development';
        return {
          pinoHttp: {
            level: isDev ? 'debug' : 'info',
            ...(isDev
              ? {
                  transport: {
                    target: 'pino-pretty',
                    options: { singleLine: true, translateTime: 'SYS:HH:MM:ss' },
                  },
                }
              : {}),
          },
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => dataSourceOptions(config),
    }),
    EventEmitterModule.forRoot(),
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => [
        {
          rootPath: path.resolve(
            process.cwd(),
            config.getOrThrow<string>('UPLOADS_DIR'),
          ),
          serveRoot: '/uploads',
          serveStaticOptions: { fallthrough: true },
        },
      ],
    }),
    ExternalModule,
    AuthModule,
    UsersModule,
    PreferencesModule,
    InviteCodesModule,
    BadgesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
