import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtUser } from '@/modules/auth/jwt.interface';

export const CurrentUser = createParamDecorator<
  keyof JwtUser | undefined,
  JwtUser | JwtUser[keyof JwtUser]
>((data, ctx: ExecutionContext): JwtUser | string => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const user = request.user as JwtUser;

  return data ? user[data] : user;
});
