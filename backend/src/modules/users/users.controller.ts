import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { UpdateProfileDto } from './dto/update-profile.dto';

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
   * PATCH /users/me
   * Update user profile
   */
  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMe(@CurrentUser() user: JwtUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateMe(user.id, dto);
  }

  /**
   * GET /users/:username
   * Returns a single user
   */
  @Get(':username')
  async getProfile(
    @Param('username') username: string,
    @PaginatedQuery() pagination: CursorDto,
  ) {
    return this.usersService.getProfile(username, pagination);
  }

  /**
   * GET /users/:username/recipes
   * Returns paginated recipes created by a user
   */
  @Get(':username/recipes')
  async getUserRecipes(
    @Param('username') username: string,
    @PaginatedQuery() pagination: CursorDto,
  ) {
    return this.usersService.getUserRecipes(username, pagination);
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
