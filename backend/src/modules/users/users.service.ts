import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { paginateEntities } from '@/common/utils/pagination.util';
import { UserEntity } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

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

        query: {
          where: {
            // Example filters
            // role: 'USER',
          },

          // Example relation include
          // include: { posts: true },
        },

        orderBy: {
          createdAt: 'desc',
        },
      },
      UserEntity,
    );
  }

  async getProfile(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: { followers: true, following: true },
        },
        recipes: {
          where: { isPublic: true },
          orderBy: { createdAt: 'desc' },
          include: {
            tags: { include: { tag: true } },
            author: true,
            _count: {
              select: { likes: true, favorites: true, comments: true },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
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
}
