import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { paginateEntities } from '@/common/utils/pagination.util';
import { UserEntity } from './entities/user.entity';

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

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }
}
