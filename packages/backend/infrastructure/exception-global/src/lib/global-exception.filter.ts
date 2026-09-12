import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

interface JsonApiError {
  status: string;
  code: string;
  title: string;
  detail?: string;
  source?: { pointer?: string; parameter?: string };
}

interface JsonApiErrorResponse {
  errors: JsonApiError[];
}

const PRisma_ERROR_MAP: Record<string, { status: number; code: string; title: string }> = {
  P2002: { status: 409, code: 'UNIQUE_VIOLATION', title: 'Resource already exists' },
  P2025: { status: 404, code: 'RECORD_NOT_FOUND', title: 'Record not found' },
  P2003: { status: 400, code: 'FOREIGN_KEY_VIOLATION', title: 'Related resource not found' },
  P2014: { status: 400, code: 'REQUIRED_RELATION_VIOLATION', title: 'Required relation violated' },
  P2000: { status: 400, code: 'VALUE_TOO_LONG', title: 'Value exceeds maximum length' },
  P2006: { status: 400, code: 'INVALID_VALUE', title: 'Invalid value provided' },
  P2011: { status: 400, code: 'NULL_CONSTRAINT_VIOLATION', title: 'Required field is missing' },
  P2012: { status: 400, code: 'MISSING_REQUIRED_VALUE', title: 'Required value is missing' },
  P2013: { status: 400, code: 'MISSING_REQUIRED_ARGUMENT', title: 'Required argument is missing' },
  P2023: { status: 400, code: 'INCONSISTENT_COLUMN_DATA', title: 'Inconsistent data' },
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isProduction = process.env.NODE_ENV === 'production';

    // Determine error response
    const errorResponse = this.buildErrorResponse(exception, isProduction);

    // Log the error
    this.logError(exception, request, errorResponse);

    response.status(errorResponse.errors[0]?.status
      ? parseInt(errorResponse.errors[0].status)
      : HttpStatus.INTERNAL_SERVER_ERROR
    ).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, isProduction: boolean): JsonApiErrorResponse {
    // HttpException (NestJS built-in or custom)
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, isProduction);
    }

    // Prisma known request errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception);
    }

    // Prisma validation errors
    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        errors: [{
          status: HttpStatus.BAD_REQUEST.toString(),
          code: 'VALIDATION_ERROR',
          title: 'Database validation failed',
          detail: isProduction ? 'Invalid data provided' : exception.message,
        }],
      };
    }

    // Generic error
    return {
      errors: [{
        status: HttpStatus.INTERNAL_SERVER_ERROR.toString(),
        code: 'INTERNAL_ERROR',
        title: 'Internal server error',
        detail: isProduction ? 'An unexpected error occurred' : this.getErrorMessage(exception),
      }],
    };
  }

  private handleHttpException(exception: HttpException, isProduction: boolean): JsonApiErrorResponse {
    const status = exception.getStatus();
    const response = exception.getResponse();

    // If response is already a string
    if (typeof response === 'string') {
      return {
        errors: [{
          status: status.toString(),
          code: this.getErrorCode(status),
          title: this.getErrorTitle(status),
          detail: isProduction && status >= 500 ? 'Internal server error' : response,
        }],
      };
    }

    // If response is an object (class-validator errors, etc.)
    const responseObj = response as Record<string, unknown>;
    const messages = responseObj?.message;
    const detail = Array.isArray(messages)
      ? messages.join('; ')
      : typeof messages === 'string'
        ? messages
        : isProduction && status >= 500
          ? 'Internal server error'
          : exception.message;

    return {
      errors: [{
        status: status.toString(),
        code: this.getErrorCode(status),
        title: this.getErrorTitle(status),
        detail: isProduction && status >= 500 ? 'Internal server error' : detail,
      }],
    };
  }

  private handlePrismaError(exception: Prisma.PrismaClientKnownRequestError): JsonApiErrorResponse {
    const code = exception.code;
    const mapped = PRisma_ERROR_MAP[code];

    if (mapped) {
      return {
        errors: [{
          status: mapped.status.toString(),
          code: mapped.code,
          title: mapped.title,
          detail: this.formatPrismaMeta(exception),
        }],
      };
    }

    return {
      errors: [{
        status: HttpStatus.INTERNAL_SERVER_ERROR.toString(),
        code: 'DATABASE_ERROR',
        title: 'Database error',
        detail: process.env.NODE_ENV === 'production'
          ? 'A database error occurred'
          : `Prisma error ${code}: ${exception.message}`,
      }],
    };
  }

  private formatPrismaMeta(exception: Prisma.PrismaClientKnownRequestError): string | undefined {
    if (process.env.NODE_ENV === 'production') return undefined;

    const meta = exception.meta;
    if (!meta) return undefined;

    if (typeof meta === 'object' && 'target' in meta) {
      return `Field: ${(meta as Record<string, unknown>).target}`;
    }
    if (typeof meta === 'object' && 'field_name' in meta) {
      return `Field: ${(meta as Record<string, unknown>).field_name}`;
    }
    return undefined;
  }

  private getErrorCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      405: 'METHOD_NOT_ALLOWED',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };
    return map[status] || 'ERROR';
  }

  private getErrorTitle(status: number): string {
    const map: Record<number, string> = {
      400: 'Bad request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not found',
      405: 'Method not allowed',
      409: 'Conflict',
      422: 'Unprocessable entity',
      429: 'Too many requests',
      500: 'Internal server error',
      502: 'Bad gateway',
      503: 'Service unavailable',
    };
    return map[status] || 'Error';
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof Error) return exception.message;
    if (typeof exception === 'string') return exception;
    return 'Unknown error';
  }

  private logError(exception: unknown, request: Request, errorResponse: JsonApiErrorResponse): void {
    const firstError = errorResponse.errors[0];
    const status = parseInt(firstError?.status || '500');
    const method = request.method;
    const url = request.url;
    const userId = (request as any).user?.id;

    const logContext = `${method} ${url}${userId ? ` [user=${userId}]` : ''}`;

    // Don't log 4xx as errors (client errors)
    if (status >= 500) {
      this.logger.error(
        `${logContext} - ${firstError.code}: ${firstError.title}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (status >= 400) {
      this.logger.warn(`${logContext} - ${firstError.code}: ${firstError.detail || firstError.title}`);
    }
  }
}
