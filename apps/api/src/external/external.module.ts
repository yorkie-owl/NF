import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.schema';
import {
  CREDIT_CLIENT,
  MockCreditClient,
  type CreditClient,
} from './credit.client';
import {
  INGREDIENTS_CLIENT,
  MockIngredientsClient,
  type IngredientsClient,
} from './ingredients.client';
import { CHAT_CLIENT, MockChatClient, type ChatClient } from './chat.client';
import {
  MATCHING_CLIENT,
  MockMatchingClient,
  type MatchingClient,
} from './matching.client';

/**
 * External module wires B/D/E/F clients. While `EXTERNAL_USE_MOCK === 'true'`
 * everything resolves to the Mock* implementations declared in this folder.
 *
 * To swap in an HTTP-backed client later: implement an HttpXxxClient class
 * and branch on `useMock` below; consumers stay unchanged.
 */
@Module({
  providers: [
    {
      provide: CREDIT_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): CreditClient => {
        const useMock =
          config.getOrThrow<'true' | 'false'>('EXTERNAL_USE_MOCK') === 'true';
        if (!useMock) {
          throw new Error(
            'Only MockCreditClient is wired; set EXTERNAL_USE_MOCK=true until the HTTP client lands.',
          );
        }
        return new MockCreditClient();
      },
    },
    {
      provide: INGREDIENTS_CLIENT,
      inject: [ConfigService],
      useFactory: (
        config: ConfigService<Env, true>,
      ): IngredientsClient => {
        const useMock =
          config.getOrThrow<'true' | 'false'>('EXTERNAL_USE_MOCK') === 'true';
        if (!useMock) {
          throw new Error(
            'Only MockIngredientsClient is wired; set EXTERNAL_USE_MOCK=true until the HTTP client lands.',
          );
        }
        return new MockIngredientsClient();
      },
    },
    {
      provide: CHAT_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): ChatClient => {
        const useMock =
          config.getOrThrow<'true' | 'false'>('EXTERNAL_USE_MOCK') === 'true';
        if (!useMock) {
          throw new Error(
            'Only MockChatClient is wired; set EXTERNAL_USE_MOCK=true until the HTTP client lands.',
          );
        }
        return new MockChatClient();
      },
    },
    {
      provide: MATCHING_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): MatchingClient => {
        const useMock =
          config.getOrThrow<'true' | 'false'>('EXTERNAL_USE_MOCK') === 'true';
        if (!useMock) {
          throw new Error(
            'Only MockMatchingClient is wired; set EXTERNAL_USE_MOCK=true until the HTTP client lands.',
          );
        }
        return new MockMatchingClient();
      },
    },
  ],
  exports: [CREDIT_CLIENT, INGREDIENTS_CLIENT, CHAT_CLIENT, MATCHING_CLIENT],
})
export class ExternalModule {}
