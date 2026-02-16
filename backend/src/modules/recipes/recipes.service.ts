import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { paginateEntities } from '@/common/utils/pagination.util';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { QueryRecipesDto } from './dto/query-recipes.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeEntity } from './entities/recipe.entity';
import { CursorDto } from '@/common/dto/cursor.dto';
import slugify from 'slugify';

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.recipe.findUnique({
        where: { slug },
      });

      if (!existing) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  async create(userId: string, dto: CreateRecipeDto) {
    const { ingredients, steps, tags, ...recipeData } = dto;

    const normalizedTags = tags?.map((tag) => tag.trim().toLowerCase());
    const normalizedIngredients = ingredients.map((i) => ({
      ...i,
      name: i.name.trim().toLowerCase(),
    }));

    const baseSlug = slugify(recipeData.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    const slug = await this.generateUniqueSlug(baseSlug);

    return this.prisma.recipe.create({
      data: {
        ...recipeData,
        slug,
        authorId: userId,

        ingredients: {
          create: normalizedIngredients,
        },

        steps: {
          create: steps,
        },

        tags: normalizedTags
          ? {
              create: normalizedTags.map((tagName) => ({
                tag: {
                  connectOrCreate: {
                    where: { name: tagName },
                    create: { name: tagName },
                  },
                },
              })),
            }
          : undefined,
      },

      include: {
        ingredients: true,
        steps: true,
        tags: {
          include: { tag: true },
        },
        author: true,
      },
    });
  }

  async findAll(query: QueryRecipesDto, pagination: CursorDto) {
    const { cursor, take } = pagination;

    return paginateEntities(
      {
        model: this.prisma.recipe,
        cursor,
        take: take || 10,
        includeTotal: true,

        query: {
          where: {
            isPublic: query.isPublic,
            ...(query.search && {
              title: {
                contains: query.search,
                mode: 'insensitive',
              },
            }),
          },
          include: { author: true },
        },

        orderBy: {
          createdAt: 'desc',
        },
      },
      RecipeEntity,
    );
  }

  async findById(id: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    return recipe;
  }

  async findBySlug(slug: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { slug },
      include: {
        ingredients: true,
        steps: true,
        tags: { include: { tag: true } },
        author: true,
      },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    return recipe;
  }

  async update(userId: string, id: string, dto: UpdateRecipeDto) {
    const existing = await this.prisma.recipe.findUnique({
      where: { id },
      select: { authorId: true, title: true },
    });

    if (!existing || existing.authorId !== userId) {
      throw new ForbiddenException();
    }

    const { ingredients, steps, tags, ...recipeData } = dto;

    const normalizedTags = tags?.map((tag) => tag.trim().toLowerCase());

    const normalizedIngredients = ingredients?.map((i) => ({
      ...i,
      name: i.name.trim().toLowerCase(),
    }));

    let slug: string | undefined;
    if (recipeData.title && recipeData.title !== existing.title) {
      const baseSlug = slugify(recipeData.title, {
        lower: true,
        strict: true,
        trim: true,
      });

      slug = await this.generateUniqueSlug(baseSlug);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.recipe.update({
        where: { id },
        data: {
          ...recipeData,
          ...(slug && { slug }),
        },
      });

      if (normalizedIngredients) {
        await tx.ingredient.deleteMany({
          where: { recipeId: id },
        });

        await tx.ingredient.createMany({
          data: normalizedIngredients.map((ingredient) => ({
            ...ingredient,
            recipeId: id,
          })),
        });
      }

      if (steps) {
        await tx.step.deleteMany({
          where: { recipeId: id },
        });

        await tx.step.createMany({
          data: steps.map((step) => ({
            ...step,
            recipeId: id,
          })),
        });
      }

      if (normalizedTags) {
        await tx.recipeTag.deleteMany({
          where: { recipeId: id },
        });

        for (const tagName of normalizedTags) {
          const tag = await tx.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName },
          });

          await tx.recipeTag.create({
            data: {
              recipeId: id,
              tagId: tag.id,
            },
          });
        }
      }

      return tx.recipe.findUnique({
        where: { id },
        include: {
          ingredients: true,
          steps: { orderBy: { order: 'asc' } },
          tags: { include: { tag: true } },
          author: true,
        },
      });
    });
  }

  async remove(userId: string, id: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe || recipe.authorId !== userId) {
      throw new ForbiddenException();
    }

    return this.prisma.recipe.delete({
      where: { id },
    });
  }
}
