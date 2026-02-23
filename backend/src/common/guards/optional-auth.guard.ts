import { JwtUser } from '@/modules/auth/jwt.interface';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.cookies?.token as string | undefined;

    if (!token) return true;

    try {
      const payload = this.jwtService.verify<JwtUser>(token);
      req.user = payload;
    } catch {
      // Token verification failed, but we continue as auth is optional
    }

    return true;
  }
}
