import { Injectable } from '@nestjs/common';

/**
 * Placeholder interface for the D module integration. Filled out when
 * D surfaces real recommendation endpoints.
 */
export interface MatchingClient {
  ping(): Promise<boolean>;
}

export const MATCHING_CLIENT = Symbol('MatchingClient');

@Injectable()
export class MockMatchingClient implements MatchingClient {
  async ping(): Promise<boolean> {
    return true;
  }
}
