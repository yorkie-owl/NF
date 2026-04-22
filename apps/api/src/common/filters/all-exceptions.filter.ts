import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ApiError } from '@lin-shi/contracts';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'COMMON_INTERNAL_ERROR';
    let message = 'Internal server error';
    let details: Record<string, unknown> | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res: unknown = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const o = res as Record<string, unknown>;
        const raw = o.message;
        if (raw !== undefined) {
          if (Array.isArray(raw)) {
            message = raw.map((x) => String(x)).join(', ');
          } else if (typeof raw === 'string') {
            message = raw;
          }
        }
      }
      code = statusCode === HttpStatus.UNAUTHORIZED ? 'AUTH_INVALID_CREDENTIALS' : 'COMMON_HTTP_EXCEPTION';
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(exception.stack);
    } else {
      this.logger.error(String(exception));
    }

    const body: ApiError = {
      statusCode,
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(body);
  }
}
