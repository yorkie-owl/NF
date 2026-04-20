import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { ApiError } from '@lin-shi/contracts';

/**
 * Converts every thrown error into the shared `ApiError` shape declared in
 * `packages/contracts` so API consumers always see a stable envelope.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, code, message, details } = this.extract(exception);

    const body: ApiError = {
      statusCode,
      code,
      message,
      timestamp: new Date().toISOString(),
      ...(details !== undefined ? { details } : {}),
    };

    if (statusCode >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} -> ${statusCode} ${code}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(statusCode).json(body);
  }

  private extract(exception: unknown): {
    statusCode: number;
    code: string;
    message: string;
    details?: Record<string, unknown>;
  } {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const raw = exception.getResponse();

      if (typeof raw === 'string') {
        return { statusCode, code: this.defaultCode(statusCode), message: raw };
      }

      if (raw !== null && typeof raw === 'object') {
        const obj = raw as Record<string, unknown>;
        const message =
          typeof obj['message'] === 'string'
            ? obj['message']
            : Array.isArray(obj['message'])
              ? obj['message'].join(', ')
              : exception.message;
        const code =
          typeof obj['code'] === 'string'
            ? obj['code']
            : this.defaultCode(statusCode);
        const details =
          obj['details'] !== undefined &&
          typeof obj['details'] === 'object' &&
          obj['details'] !== null
            ? (obj['details'] as Record<string, unknown>)
            : undefined;
        return details !== undefined
          ? { statusCode, code, message, details }
          : { statusCode, code, message };
      }

      return {
        statusCode,
        code: this.defaultCode(statusCode),
        message: exception.message,
      };
    }

    const message =
      exception instanceof Error ? exception.message : 'Internal server error';
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'COMMON_INTERNAL_ERROR',
      message,
    };
  }

  private defaultCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'COMMON_BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'COMMON_UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'COMMON_FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'COMMON_NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'COMMON_CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'COMMON_UNPROCESSABLE_ENTITY';
      default:
        return status >= 500 ? 'COMMON_INTERNAL_ERROR' : 'COMMON_ERROR';
    }
  }
}
