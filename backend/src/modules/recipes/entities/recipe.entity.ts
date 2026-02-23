import { UserEntity } from '@/modules/users/entities/user.entity';
import { Expose, Exclude, Type } from 'class-transformer';
import { IngredientEntity } from './ingredient.entity';
import { StepEntity } from './step.entity';
import { CommentEntity } from './comment.entity';
import { TagEntity } from './tag.entity';
import { UserStatusEntity } from './user-status.entity';

export class RecipeEntity {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  coverImageUrl?: string | null;

  @Expose()
  slug: string;

  @Expose()
  description?: string | null;

  @Expose()
  @Type(() => IngredientEntity)
  ingredients: IngredientEntity[];

  @Expose()
  @Type(() => StepEntity)
  steps: StepEntity[];

  @Expose()
  @Type(() => TagEntity)
  tags: TagEntity[];

  @Expose()
  isPublic: boolean;

  @Expose()
  @Type(() => UserEntity)
  author?: UserEntity;

  @Expose()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  authorId: string;

  @Expose()
  likesCount: number;

  @Expose()
  favoritesCount: number;

  @Expose()
  commentsCount: number;

  @Expose()
  @Type(() => CommentEntity)
  comments: CommentEntity[];

  @Expose()
  @Type(() => UserStatusEntity)
  userStatus: UserStatusEntity | null;

  constructor(
    partial: Omit<Partial<RecipeEntity>, 'tags'> & {
      _count?: { likes?: number; favorites?: number; comments?: number };
      tags?: { tag: { id: string; name: string } }[];
      userStatus?: {
        isFollowing: boolean;
        isLiked: boolean;
        isFavorited: boolean;
      } | null;
    },
  ) {
    const { tags, ...rest } = partial;

    Object.assign(this, rest);

    this.likesCount = partial._count?.likes ?? 0;
    this.favoritesCount = partial._count?.favorites ?? 0;
    this.commentsCount = partial._count?.comments ?? 0;
    this.tags = tags?.map((rt) => new TagEntity(rt.tag)) ?? [];
    this.userStatus = partial.userStatus ?? null;
  }
}
