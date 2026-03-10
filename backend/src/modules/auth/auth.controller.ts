import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Get,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/generated/prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/register
   * Registers a new user
   */
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, user } = await this.authService.register(dto);

    res.cookie('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 day,
    });

    return { user };
  }

  /**
   * POST /auth/login
   * Logs in an existing user
   * Returns a JWT token
   */
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, user } = await this.authService.login(dto);

    res.cookie('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 day,
    });

    return { user };
  }

  /**
   * GET /auth/logout
   * Logs out the current user
   * Deletes the JWT token cookie
   */
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
    return { success: true };
  }

  /**
   * GET /auth/validate
   * Validates a JWT token
   * Returns the decoded token payload
   */
  @Get('validate')
  validate(@Req() req: Request) {
    const token = (req.cookies as Record<string, string>)?.token;

    if (!token) throw new UnauthorizedException('No token provided');

    return this.authService.verifyToken(token);
  }

  /**
   * POST /auth/forgot-password
   * Forgot password
   */
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    // always return the same response
    return { message: 'If that email exists, a reset link has been sent' };
  }

  /**
   * POST /auth/reset-password
   * Reset password
   */
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password);
    return { message: 'Password reset successfully' };
  }

  /**
   * GET /auth/google
   * Google OAuth
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Guard redirects to Google
  }

  /**
   * GET /auth/google/callback
   * Google OAuth callback
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token } = this.authService.generateToken(user);

    res.cookie('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.redirect(process.env.FRONTEND_URL!);
  }
}
