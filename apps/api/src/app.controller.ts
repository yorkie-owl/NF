import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@lin-shi/contracts';

@Controller()
export class AppController {
  @Get('health')
  health(): HealthResponse {
    return { ok: true, ts: new Date().toISOString() };
  }
}
