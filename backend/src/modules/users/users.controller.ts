import { Controller, Get, Query, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CursorDto } from '@/common/dto/cursor.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users?cursor=abc
   * Returns paginated users using cursor pagination
   */
  @Get()
  async findAll(@Query() query: CursorDto) {
    const { cursor, take } = query;
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
