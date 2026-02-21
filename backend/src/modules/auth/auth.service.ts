import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { User } from '@/generated/prisma/client';
import { JwtUser } from './jwt.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
      },
    });
    const payload = { id: user.id, username: user.username, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password)
      throw new UnauthorizedException('Invalid credentials');
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    const payload = { id: user.id, username: user.username, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }

  verifyToken(token: string): JwtUser {
    return this.jwtService.verify<JwtUser>(token);
  }
}
