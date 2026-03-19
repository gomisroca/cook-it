import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CollectionEntity } from './entities/collection.entity';
import slugify from 'slugify';
import { CursorDto } from '@/common/dto/cursor.dto';
import { paginateEntities } from '@/common/utils/pagination.util';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateUniqueSlug(base: string): Promise<string> {
    let slug = base;
    let suffix = 1;
    while (await this.prisma.collection.findUnique({ where: { slug } })) {
      slug = `${base}-${suffix++}`;
    }
    return slug;
  }

  async findPublic(pagination: CursorDto, requesterId?: string) {
    return paginateEntities(
      {
        model: this.prisma.collection,
        cursor: pagination.cursor,
        take: pagination.take || 12,
        includeTotal: false,
        query: {
          where: { isPublic: true },
          include: {
            author: true,
            _count: { select: { recipes: true, likes: true } },
            ...(requesterId && {
              likes: {
                where: { userId: requesterId },
                select: { userId: true },
              },
            }),
          },
        },
        orderBy: { likes: { _count: 'desc' } },
      },
      CollectionEntity,
    );
  }

  async findMyCollections(userId: string, pagination: CursorDto) {
    return paginateEntities(
      {
        model: this.prisma.collection,
        cursor: pagination.cursor,
        take: pagination.take || 12,
        includeTotal: false,
        query: {
          where: { authorId: userId },
          include: {
            author: true,
            _count: { select: { recipes: true, likes: true } },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      CollectionEntity,
    );
  }

  async create(userId: string, dto: CreateCollectionDto) {
    const baseSlug = slugify(dto.name, {
      lower: true,
      strict: true,
      trim: true,
    });
    const slug = await this.generateUniqueSlug(baseSlug);

    const collection = await this.prisma.collection.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        isPublic: dto.isPublic ?? true,
        authorId: userId,
      },
      include: {
        author: true,
        _count: { select: { recipes: true } },
      },
    });

    return new CollectionEntity(collection);
  }

  async update(userId: string, slug: string, dto: UpdateCollectionDto) {
    const collection = await this.prisma.collection.findUnique({
      where: { slug },
    });
    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.authorId !== userId) throw new ForbiddenException();

    let newSlug: string | undefined;
    if (dto.name && dto.name !== collection.name) {
      const baseSlug = slugify(dto.name, {
        lower: true,
        strict: true,
        trim: true,
      });
      newSlug = await this.generateUniqueSlug(baseSlug);
    }

    const updated = await this.prisma.collection.update({
      where: { slug },
      data: {
        name: dto.name ?? collection.name,
        description: dto.description ?? collection.description,
        isPublic: dto.isPublic ?? collection.isPublic,
        ...(newSlug && { slug: newSlug }),
      },
      include: {
        author: true,
        _count: { select: { recipes: true } },
      },
    });

    return new CollectionEntity(updated);
  }

  async findByUser(username: string, requesterId?: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException('User not found');

    const isOwner = requesterId === user.id;

    const collections = await this.prisma.collection.findMany({
      where: {
        authorId: user.id,
        ...(!isOwner && { isPublic: true }),
      },
      include: {
        author: true,
        _count: { select: { recipes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return collections.map((c) => new CollectionEntity(c));
  }

  async getCollectionsForRecipe(userId: string, recipeId: string) {
    return this.prisma.collectionRecipe.findMany({
      where: {
        recipeId,
        collection: { authorId: userId },
      },
      select: { collectionId: true },
    });
  }

  async findBySlug(slug: string, requesterId?: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { slug },
      include: {
        author: true,
        _count: { select: { recipes: true, likes: true } },
        ...(requesterId && {
          likes: { where: { userId: requesterId }, select: { userId: true } },
        }),
        recipes: {
          orderBy: { addedAt: 'desc' },
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
        },
      },
    });

    if (!collection) throw new NotFoundException('Collection not found');
    if (!collection.isPublic && collection.authorId !== requesterId) {
      throw new ForbiddenException();
    }

    return new CollectionEntity(collection);
  }

  async toggleLike(userId: string, slug: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { slug },
    });
    if (!collection) throw new NotFoundException('Collection not found');
    if (!collection.isPublic) throw new ForbiddenException();

    const existing = await this.prisma.collectionLike.findUnique({
      where: { userId_collectionId: { userId, collectionId: collection.id } },
    });

    if (existing) {
      await this.prisma.collectionLike.delete({
        where: { userId_collectionId: { userId, collectionId: collection.id } },
      });
      return { liked: false };
    }

    await this.prisma.collectionLike.create({
      data: { userId, collectionId: collection.id },
    });
    return { liked: true };
  }

  async addRecipe(userId: string, slug: string, recipeId: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { slug },
    });
    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.authorId !== userId) throw new ForbiddenException();

    try {
      await this.prisma.collectionRecipe.create({
        data: { collectionId: collection.id, recipeId },
      });
    } catch {
      throw new ConflictException('Recipe already in collection');
    }

    return { success: true };
  }

  async removeRecipe(userId: string, slug: string, recipeId: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { slug },
    });
    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.authorId !== userId) throw new ForbiddenException();

    await this.prisma.collectionRecipe.delete({
      where: {
        collectionId_recipeId: { collectionId: collection.id, recipeId },
      },
    });

    return { success: true };
  }

  async delete(userId: string, slug: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { slug },
    });
    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.authorId !== userId) throw new ForbiddenException();

    await this.prisma.collection.delete({ where: { slug } });
    return { success: true };
  }
}
