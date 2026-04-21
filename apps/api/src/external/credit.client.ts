import { Injectable } from '@nestjs/common';

export interface CreditScoreDto {
  userId: string;
  score: number;
  updatedAt: string;
}

export interface CreditClient {
  getUserCredit(userId: string): Promise<CreditScoreDto>;
}

export const CREDIT_CLIENT = Symbol('CreditClient');

@Injectable()
export class MockCreditClient implements CreditClient {
  async getUserCredit(userId: string): Promise<CreditScoreDto> {
    return {
      userId,
      score: 60,
      updatedAt: new Date().toISOString(),
    };
  }
}
