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
import { SkipTransform } from '@/common/decorators/skip-transform.decorator';

@UseGuards(AuthGuard)
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  /**
   * POST /recipes
   * Creates a new recipe
   */
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateRecipeDto) {
    return this.recipesService.create(user.id, dto);
  }

  /**
   * GET /recipes
   * Returns paginated recipes
   */
  @Get()
  @SkipTransform()
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
  async findBySlug(@Param('slug') slug: string) {
    const recipe = await this.recipesService.findBySlug(slug);
    return new RecipeEntity(recipe);
  }

  // /**
  //  * GET /recipes/:id
  //  * Returns a single recipe by ID
  //  */
  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   const recipe = await this.recipesService.findOne(id);
  //   return new RecipeEntity(recipe);
  // }

  /**
   * PATCH /recipes/:id
   * Updates a recipe by ID
   */
  @Patch(':id')
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
  remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.recipesService.remove(user.id, id);
  }
}
