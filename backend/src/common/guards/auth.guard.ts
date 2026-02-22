import { JwtUser } from '@/modules/auth/jwt.interface';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    const token = req.cookies?.token as string | undefined;
    if (!token) return false;

    try {
      const payload = this.jwtService.verify<JwtUser>(token);
      req.user = payload;
      return true;
    } catch {
      return false;
    }
  }
}
