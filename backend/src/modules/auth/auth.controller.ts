import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/register
   * Registers a new user
   */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return { id: user.id, email: user.email, username: user.username };
  }

  /**
   * POST /auth/login
   * Logs in an existing user
   * Returns a JWT token
   */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * GET /auth/validate
   * Validates a JWT token
   * Returns the decoded token payload
   */
  @Get('validate')
  validate(@Headers('Authorization') authHeader: string) {
    if (!authHeader) throw new UnauthorizedException('No token provided');

    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedException('No token provided');

    return this.authService.verifyToken(token);
  }
}
