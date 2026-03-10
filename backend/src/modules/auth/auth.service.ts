import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Role, User } from '@/generated/prisma/client';
import { JwtUser } from './jwt.interface';
import { MailService } from '../mail/mail.service';
import slugify from 'slugify';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  generateToken(user: { id: string; email: string; role: Role }) {
    const payload: JwtUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    return { access_token: this.jwtService.sign(payload) };
  }

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

    const { access_token } = this.generateToken(user);
    return { access_token, user: payload };
  }

  verifyToken(token: string): JwtUser {
    return this.jwtService.verify<JwtUser>(token);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) return;

    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.mailService.sendPasswordReset(email, resetUrl);
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { password: hashed },
      }),
      this.prisma.passwordResetToken.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
    ]);
  }

  async findOrCreateGoogleUser({
    googleId,
    email,
    displayName,
    avatarUrl,
  }: {
    googleId: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
  }) {
    let user = await this.prisma.user.findUnique({ where: { googleId } });
    if (user) return user;

    user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      return this.prisma.user.update({
        where: { email },
        data: { googleId, avatarUrl: user.avatarUrl ?? avatarUrl },
      });
    }

    const baseUsername = slugify(displayName, {
      lower: true,
      strict: true,
      trim: true,
    });

    let username = baseUsername;
    let suffix = 1;
    while (await this.prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${suffix++}`;
    }

    return this.prisma.user.create({
      data: {
        email,
        googleId,
        username,
        avatarUrl,
      },
    });
  }
}
