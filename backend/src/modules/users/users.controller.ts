import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CursorDto } from '@/common/dto/cursor.dto';
import { PaginatedQuery } from '@/common/decorators/paginated-query.decorator';
import { SkipTransform } from '@/common/decorators/skip-transform.decorator';

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
}
