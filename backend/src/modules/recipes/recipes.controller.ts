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
import { RecipesService } from './recipes.service';
import { PaginatedQuery } from '@/common/decorators/paginated-query.decorator';
import { AuthGuard } from '@/common/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtUser } from '@/modules/auth/jwt.interface';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { QueryRecipesDto } from './dto/query-recipes.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeEntity } from './entities/recipe.entity';
import { CursorDto } from '@/common/dto/cursor.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { OptionalAuthGuard } from '@/common/guards/optional-auth.guard';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  /**
   * POST /recipes
   * Creates a new recipe
   */
  @Post()
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateRecipeDto) {
    return this.recipesService.create(user.id, dto);
  }

  /**
   * GET /recipes
   * Returns paginated recipes
   */
  @Get()
  async findAll(
    @Query() query: QueryRecipesDto,
    @PaginatedQuery() pagination: CursorDto,
  ) {
    return this.recipesService.findAll(query, pagination);
  }

  /**
   * GET /recipes/:slug
   *  Returns a single recipe by slug
   */
  @Get(':slug')
  @UseGuards(OptionalAuthGuard)
  async findBySlug(@Param('slug') slug: string, @CurrentUser() user?: JwtUser) {
    const recipe = await this.recipesService.findBySlug(slug, user?.id);
    return new RecipeEntity(recipe);
  }

  /**
   * PATCH /recipes/:id
   * Updates a recipe by ID
   */
  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(user.id, id, dto);
  }

  /**
   * DELETE /recipes/:id
   * Deletes a recipe by ID
   */
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.recipesService.remove(user.id, id);
  }

  /**
   * POST /recipes/:id/like
   * Adds a like to a recipe
   */
  @Post(':id/like')
  @UseGuards(AuthGuard)
  addLike(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    console.log(user.id, id);
    return this.recipesService.addLike(user.id, id);
  }

  /**
   * DELETE /recipes/:id/like
   * Removes a like from a recipe
   */
  @Delete(':id/like')
  @UseGuards(AuthGuard)
  removeLike(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.recipesService.removeLike(user.id, id);
  }

  /**
   * POST /recipes/:id/favorite
   * Adds a favorite to a recipe
   */
  @Post(':id/favorite')
  @UseGuards(AuthGuard)
  addFavorite(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.recipesService.addFavorite(user.id, id);
  }

  /**
   * DELETE /recipes/:id/favorite
   * Removes a favorite from a recipe
   */
  @Delete(':id/favorite')
  @UseGuards(AuthGuard)
  removeFavorite(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.recipesService.removeFavorite(user.id, id);
  }

  /**
   * POST /recipes/:id/comment
   * Adds a comment to a recipe
   */
  @Post(':id/comment')
  @UseGuards(AuthGuard)
  addComment(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() body: CreateCommentDto,
  ) {
    return this.recipesService.addComment(user.id, id, body.content);
  }

  /**
   * PATCH /recipes/comments/:commentId
   * Updates a comment on a recipe
   */
  @Patch('/comments/:id')
  @UseGuards(AuthGuard)
  updateComment(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() body: CreateCommentDto,
  ) {
    return this.recipesService.updateComment(user.id, id, body.content);
  }

  /**
   * DELETE /recipes/comments/:id
   * Removes a comment from a recipe
   */
  @Delete('/comments/:id')
  @UseGuards(AuthGuard)
  removeComment(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.recipesService.removeComment(id, user.id);
  }
}
