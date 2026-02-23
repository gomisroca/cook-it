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
import { UploadthingService } from '@/modules/uploadthing/uploadthing.service';

@Injectable()
export class RecipesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadthingService: UploadthingService,
  ) {}

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
          include: {
            ingredients: true,
            steps: true,
            tags: { include: { tag: true } },
            author: true,
            _count: {
              select: { likes: true, favorites: true, comments: true },
            },
          },
        },

        orderBy: {
          createdAt: 'desc',
        },
      },
      RecipeEntity,
    );
  }

  async findBySlug(slug: string, userId?: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { slug },
      include: {
        ingredients: true,
        steps: true,
        tags: { include: { tag: true } },
        author: true,
        _count: {
          select: { likes: true, favorites: true, comments: true },
        },
        comments: { include: { user: true } },
        ...(userId && {
          likes: { where: { userId }, select: { userId: true } },
          favorites: { where: { userId }, select: { userId: true } },
        }),
      },
    });

    if (!recipe) throw new NotFoundException('Recipe not found');

    let isFollowing = false;
    if (userId) {
      const follow = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: recipe.author.id,
          },
        },
      });
      isFollowing = !!follow;
    }

    return {
      ...recipe,
      userStatus: userId
        ? {
            isFollowing,
            isLiked: recipe.likes?.length > 0,
            isFavorited: recipe.favorites?.length > 0,
          }
        : null,
    };
  }

  async update(userId: string, id: string, dto: UpdateRecipeDto) {
    const existing = await this.prisma.recipe.findUnique({
      where: { id },
      select: {
        authorId: true,
        title: true,
        coverImageUrl: true,
        steps: { select: { imageUrl: true } },
      },
    });

    if (!existing || existing.authorId !== userId) {
      throw new ForbiddenException();
    }

    const { ingredients, steps, tags, ...recipeData } = dto;

    const urlsToDelete: string[] = [];

    if (
      recipeData.coverImageUrl !== undefined &&
      existing.coverImageUrl &&
      existing.coverImageUrl !== recipeData.coverImageUrl
    ) {
      urlsToDelete.push(existing.coverImageUrl);
    }

    if (steps) {
      const newStepUrls = new Set(steps.map((s) => s.imageUrl).filter(Boolean));

      for (const oldStep of existing.steps) {
        if (oldStep.imageUrl && !newStepUrls.has(oldStep.imageUrl)) {
          urlsToDelete.push(oldStep.imageUrl);
        }
      }
    }

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

    const result = await this.prisma.$transaction(async (tx) => {
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

    if (urlsToDelete.length > 0) {
      await this.uploadthingService.deleteFiles(urlsToDelete);
    }

    return result;
  }

  async remove(userId: string, id: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: { steps: { select: { imageUrl: true } } },
    });

    if (!recipe || recipe.authorId !== userId) {
      throw new ForbiddenException();
    }
    const urlsToDelete = [
      recipe.coverImageUrl,
      ...recipe.steps.map((s) => s.imageUrl),
    ].filter(Boolean) as string[];

    if (urlsToDelete.length > 0) {
      await this.uploadthingService.deleteFiles(urlsToDelete);
    }

    return this.prisma.recipe.delete({
      where: { id },
    });
  }

  async userStatus(userId: string, slug: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { slug },
      select: {
        author: { select: { id: true } },
        likes: {
          where: { userId },
          select: { userId: true },
        },
        favorites: {
          where: { userId },
          select: { userId: true },
        },
      },
    });

    if (!recipe) throw new NotFoundException('Recipe not found');

    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: recipe.author.id,
        },
      },
    });

    return {
      isFollowing: !!follow,
      isLiked: recipe.likes.length > 0,
      isFavorited: recipe.favorites.length > 0,
    };
  }

  async addLike(userId: string, id: string) {
    return this.prisma.like.create({
      data: {
        userId,
        recipeId: id,
      },
    });
  }

  async removeLike(userId: string, id: string) {
    return this.prisma.like.delete({
      where: { userId_recipeId: { userId, recipeId: id } },
    });
  }

  async addFavorite(userId: string, id: string) {
    return this.prisma.favorite.create({
      data: {
        userId,
        recipeId: id,
      },
    });
  }

  async removeFavorite(userId: string, id: string) {
    return this.prisma.favorite.delete({
      where: { userId_recipeId: { userId, recipeId: id } },
    });
  }

  async addComment(userId: string, recipeId: string, content: string) {
    return this.prisma.comment.create({
      data: {
        userId,
        recipeId,
        content,
      },
      include: { user: true },
    });
  }

  async updateComment(userId: string, commentId: string, content: string) {
    return this.prisma.comment.update({
      where: { id: commentId, userId },
      data: { content },
      include: { user: true },
    });
  }

  async removeComment(commentId: string, userId: string) {
    return this.prisma.comment.deleteMany({
      where: { id: commentId, userId },
    });
  }
}
