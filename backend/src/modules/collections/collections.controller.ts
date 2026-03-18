import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { JwtUser } from '../auth/jwt.interface';
import { AuthGuard } from '@/common/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { OptionalAuthGuard } from '@/common/guards/optional-auth.guard';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { PaginatedQuery } from '@/common/decorators/paginated-query.decorator';
import { CursorDto } from '@/common/dto/cursor.dto';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  /**
   * GET /collections
   * Get all public collections
   */
  @Get()
  findPublic(@PaginatedQuery() pagination: CursorDto) {
    return this.collectionsService.findPublic(pagination);
  }

  /**
   * POST /collections
   * Create a collection
   */
  @Post()
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateCollectionDto) {
    return this.collectionsService.create(user.id, dto);
  }

  /**
   * GET /collections/mine
   * Get all collections created by the user
   */
  @Get('mine')
  @UseGuards(AuthGuard)
  findMine(
    @CurrentUser() user: JwtUser,
    @PaginatedQuery() pagination: CursorDto,
  ) {
    return this.collectionsService.findMyCollections(user.id, pagination);
  }

  /**
   * GET /collections/user/:username
   * Get collections by username
   */
  @Get('user/:username')
  @UseGuards(OptionalAuthGuard)
  findByUser(
    @Param('username') username: string,
    @CurrentUser() user?: JwtUser,
  ) {
    return this.collectionsService.findByUser(username, user?.id);
  }

  /**
   * GET /collections/recipe/:recipeId
   * Get collections for a recipe
   */
  @Get('recipe/:recipeId')
  @UseGuards(AuthGuard)
  getCollectionsForRecipe(
    @CurrentUser() user: JwtUser,
    @Param('recipeId') recipeId: string,
  ) {
    return this.collectionsService.getCollectionsForRecipe(user.id, recipeId);
  }

  /**
   * GET /collections/:slug
   * Get a collection by slug
   */
  @Get(':slug')
  @UseGuards(OptionalAuthGuard)
  findBySlug(@Param('slug') slug: string, @CurrentUser() user?: JwtUser) {
    return this.collectionsService.findBySlug(slug, user?.id);
  }

  /**
   * PATCH /collections/:slug
   * Update a collection
   */
  @Patch(':slug')
  @UseGuards(AuthGuard)
  update(
    @CurrentUser() user: JwtUser,
    @Param('slug') slug: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.collectionsService.update(user.id, slug, dto);
  }

  /**
   * POST /collections/:slug/recipes/:recipeId
   * Add a recipe to a collection
   */
  @Post(':slug/recipes/:recipeId')
  @UseGuards(AuthGuard)
  addRecipe(
    @CurrentUser() user: JwtUser,
    @Param('slug') slug: string,
    @Param('recipeId') recipeId: string,
  ) {
    return this.collectionsService.addRecipe(user.id, slug, recipeId);
  }

  /**
   * DELETE /collections/:slug/recipes/:recipeId
   * Delete a recipe from a collection
   */
  @Delete(':slug/recipes/:recipeId')
  @UseGuards(AuthGuard)
  removeRecipe(
    @CurrentUser() user: JwtUser,
    @Param('slug') slug: string,
    @Param('recipeId') recipeId: string,
  ) {
    return this.collectionsService.removeRecipe(user.id, slug, recipeId);
  }

  /**
   * DELETE /collections/:slug
   * Delete a collection
   */
  @Delete(':slug')
  @UseGuards(AuthGuard)
  delete(@CurrentUser() user: JwtUser, @Param('slug') slug: string) {
    return this.collectionsService.delete(user.id, slug);
  }
}
