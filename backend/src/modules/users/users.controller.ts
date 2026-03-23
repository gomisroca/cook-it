import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { ChangePasswordDto } from './dto/change-password.dto';

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
   * PATCH /users/me/password
   * Change user password
   */
  @Patch('me/password')
  @UseGuards(AuthGuard)
  changePassword(@CurrentUser() user: JwtUser, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.id, dto);
  }

  /**
   * GET /users/:username
   * Returns a single user
   */
  @Get(':username')
  async getProfile(
    @Param('username') username: string,
    @Query('recipesCursor') recipesCursor?: string,
    @Query('collectionsCursor') collectionsCursor?: string,
    @Query('take') take?: number,
  ) {
    return this.usersService.getProfile(username, {
      recipesCursor,
      collectionsCursor,
      take,
    });
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
   * GET /users/:username/likes
   * Returns liked recipes by a user
   */
  @Get(':username/likes')
  async getLikes(@Param('username') username: string) {
    return this.usersService.getLikes(username);
  }

  /**
   * GET /users/:username/favorites
   * Returns favorited recipes by a user
   */
  @Get(':username/favorites')
  async getFavorites(@Param('username') username: string) {
    return this.usersService.getFavorites(username);
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
