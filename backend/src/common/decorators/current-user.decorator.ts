import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtUser } from '@/modules/auth/jwt.interface';
import { UserEntity } from '@/modules/users/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserEntity => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as JwtUser;

    return new UserEntity(user);
  },
);
