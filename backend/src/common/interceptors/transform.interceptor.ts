import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map } from 'rxjs';
import { SKIP_TRANSFORM } from '../decorators/skip-transform.decorator';

interface TransformResponse<T> {
  status: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  TransformResponse<T>
> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const skip = this.reflector.get<boolean>(
      SKIP_TRANSFORM,
      context.getHandler(),
    );
    if (skip) return next.handle();
    return next.handle().pipe(map((data: T) => ({ status: 'success', data })));
  }
}
