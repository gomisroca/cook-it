import { UserEntity } from '@/modules/users/entities/user.entity';
import { Expose, Exclude, Type } from 'class-transformer';
import { IngredientEntity } from './ingredient.entity';
import { StepEntity } from './step.entity';
import { CommentEntity } from './comment.entity';

export class RecipeEntity {
  @Expose()
  id: string;

  @Expose()
  title: string;

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

  constructor(
    partial: Partial<RecipeEntity> & {
      _count?: { likes?: number; favorites?: number; comments?: number };
    },
  ) {
    Object.assign(this, partial);

    this.likesCount = partial._count?.likes ?? 0;
    this.favoritesCount = partial._count?.favorites ?? 0;
    this.commentsCount = partial._count?.comments ?? 0;
  }
}
