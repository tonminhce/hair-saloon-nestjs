import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, catchError } from 'rxjs';
import { handlePrismaError } from '../utils/prisma-exception.helper';

@Injectable()
export class PrismaErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        throw handlePrismaError(error);
      }),
    );
  }
}
