import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CursorDto } from '@/common/dto/cursor.dto';
import { PaginatedQuery } from '@/common/decorators/paginated-query.decorator';
import { AuthGuard } from '@/common/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserEntity } from './entities/user.entity';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users?cursor=abc
   * Returns paginated users using cursor pagination
   */
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @Get()
  @UseInterceptors(LoggingInterceptor) // Skip TransformInterceptor
  async findAll(@PaginatedQuery() { cursor, take }: CursorDto) {
    return this.usersService.findAll(cursor, take);
  }

  /**
   * GET /users/me
   * Returns the currently authenticated user
   */
  @UseGuards(AuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: UserEntity): UserEntity {
    return user;
  }

  /**
   * GET /users/:id
   * Returns a single user by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
