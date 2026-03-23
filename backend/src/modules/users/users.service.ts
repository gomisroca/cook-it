import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { paginateEntities } from '@/common/utils/pagination.util';
import { UserEntity } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CursorDto } from '@/common/dto/cursor.dto';
import { RecipeEntity } from '../recipes/entities/recipe.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import bcrypt from 'bcrypt';
import { CollectionEntity } from '../collections/entities/collection.entity';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(cursor?: string, take?: number) {
    return paginateEntities(
      {
        model: this.prisma.user,
        cursor,
        take: take || 10,
        includeTotal: true,

        orderBy: {
          createdAt: 'desc',
        },
      },
      UserEntity,
    );
  }

  async getProfile(
    username: string,
    pagination: {
      recipesCursor?: string;
      collectionsCursor?: string;
      take?: number;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            likes: true,
            favorites: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const [recipes, collections] = await Promise.all([
      paginateEntities(
        {
          model: this.prisma.recipe,
          cursor: pagination.recipesCursor,
          take: pagination.take || 9,
          includeTotal: false,
          query: {
            where: { authorId: user.id, isPublic: true },
            include: {
              tags: { include: { tag: true } },
              author: true,
              _count: {
                select: { likes: true, favorites: true, comments: true },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        RecipeEntity,
      ),
      paginateEntities(
        {
          model: this.prisma.collection,
          cursor: pagination.collectionsCursor,
          take: pagination.take || 9,
          includeTotal: false,
          query: {
            where: { authorId: user.id, isPublic: true },
            include: {
              author: true,
              _count: { select: { likes: true, recipes: true } },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        CollectionEntity,
      ),
    ]);

    return { ...user, recipes, collections };
  }

  async getUserRecipes(username: string, pagination: CursorDto) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return paginateEntities(
      {
        model: this.prisma.recipe,
        cursor: pagination.cursor,
        take: pagination.take || 9,
        includeTotal: false,
        query: {
          where: { authorId: user.id, isPublic: true },
          include: {
            tags: { include: { tag: true } },
            author: true,
            _count: {
              select: { likes: true, favorites: true, comments: true },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      RecipeEntity,
    );
  }

  async getLikes(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException('User not found');

    const likes = await this.prisma.like.findMany({
      where: { userId: user.id },
      include: {
        recipe: {
          include: {
            tags: { include: { tag: true } },
            author: true,
            _count: {
              select: { likes: true, favorites: true, comments: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return likes.map((l) => new RecipeEntity(l.recipe));
  }

  async getFavorites(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException('User not found');

    const favorites = await this.prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        recipe: {
          include: {
            tags: { include: { tag: true } },
            author: true,
            _count: {
              select: { likes: true, favorites: true, comments: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((f) => new RecipeEntity(f.recipe));
  }

  async follow(userId: string, followId: string) {
    return this.prisma.follow.create({
      data: {
        followerId: userId,
        followingId: followId,
      },
    });
  }

  async unfollow(userId: string, followId: string) {
    return this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: followId,
        },
      },
    });
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        username: true,
        bio: true,
        avatarUrl: true,
        email: true,
        role: true,
      },
    });

    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) throw new NotFoundException('User not found');

    // Google-only users have no password
    if (!user.password) {
      throw new BadRequestException(
        'This account uses Google sign-in and has no password to change',
      );
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid)
      throw new BadRequestException('Current password is incorrect');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { message: 'Password changed successfully' };
  }
}
