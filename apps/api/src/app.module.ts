import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { AppConfigModule } from './config/config.module';
import { dataSourceOptions } from './config/typeorm.config';
import { AppController } from './app.controller';
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
  ],
  controllers: [AppController],
})
export class AppModule {}
