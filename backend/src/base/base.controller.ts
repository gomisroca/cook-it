import {
  Body,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BaseService } from './base.service';

export abstract class BaseController<
  Model extends { id: string },
  CreateDto,
  UpdateDto,
  QueryDto,
  Service extends BaseService<Model, any, any, any, any>,
> {
  constructor(protected readonly service: Service) {}

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne({ id });
  }

  @Get()
  async findAll(@Query() query: QueryDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.service.findAll(query as any);
  }

  @Get('paginated')
  async findPaginated(@Query() query: QueryDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.service.findPaginated(query as any);
  }

  @Post()
  async create(@Body() data: CreateDto) {
    return this.service.create(data as any);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() data: UpdateDto,
  ) {
    return this.service.update({
      where: { id },
      data,
    } as any);
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove({ id });
  }
}
