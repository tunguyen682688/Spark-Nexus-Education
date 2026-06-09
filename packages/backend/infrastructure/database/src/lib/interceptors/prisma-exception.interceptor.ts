import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaExceptionInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler
  ): Observable<unknown> {
    return next.handle().pipe(
      catchError((error) => {
        // Handle Prisma-specific errors with code
        if (error.code) {
          switch (error.code) {
            case 'P2002':
              throw new ConflictException(
                `Unique constraint failed on field: ${error.meta?.target}`
              );
            case 'P2025':
              throw new NotFoundException('Record not found');
            case 'P2003':
              throw new BadRequestException('Foreign key constraint failed');
            case 'P2000':
              throw new BadRequestException('Value too long for column');
            case 'P2001':
              throw new NotFoundException('Record does not exist');
            default:
              throw new InternalServerErrorException('Database error occurred');
          }
        }

        // Handle validation errors
        if (error instanceof Prisma.PrismaClientValidationError) {
          throw new BadRequestException('Invalid data provided');
        }

        // Re-throw other errors
        return throwError(() => error);
      })
    );
  }
}
