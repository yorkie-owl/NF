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
    // While F (credit) is not wired, mock returns a score that passes the
    // HIGH_TRUST gate (threshold 70) so the C activity flow is not blocked.
    // See task prompt: "未就绪时 mock 返回 100 通过".
    return {
      userId,
      score: 100,
      updatedAt: new Date().toISOString(),
    };
  }
}
