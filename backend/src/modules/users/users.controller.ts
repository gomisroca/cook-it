import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CursorDto } from '@/common/dto/cursor.dto';
import { PaginatedQuery } from '@/common/decorators/paginated-query.decorator';
import { SkipTransform } from '@/common/decorators/skip-transform.decorator';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtUser } from '../auth/jwt.interface';
import { AuthGuard } from '@/common/guards/auth.guard';

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
  @SkipTransform()
  async findAll(@PaginatedQuery() { cursor, take }: CursorDto) {
    return this.usersService.findAll(cursor, take);
  }

  /**
   * GET /users/:id
   * Returns a single user by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
  /**
   * GET /users/follow-status/:id
   * Returns the follow status of a user
   */
  @Get('/follow-status/:id')
  @UseGuards(AuthGuard)
  async followStatus(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.usersService.followStatus(user.id, id);
  }

  /**
   * POST /users/follow/:id
   * Follow a user
   */
  @Post('follow/:id')
  @UseGuards(AuthGuard)
  async follow(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.usersService.follow(user.id, id);
  }

  /**
   * DELETE /users/follow/:id
   * Unfollow a user
   */
  @Delete('follow/:id')
  @UseGuards(AuthGuard)
  async unfollow(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.usersService.unfollow(user.id, id);
  }
}
