import { UserEntity } from '@/modules/users/entities/user.entity';
import { Expose, Exclude, Type } from 'class-transformer';
import { IngredientEntity } from './ingredient.entity';
import { StepEntity } from './step.entity';
import { FavoriteEntity } from './favorite.entity';
import { LikeEntity } from './like.entity';
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
  @Type(() => FavoriteEntity)
  favorites: FavoriteEntity[];

  @Expose()
  @Type(() => LikeEntity)
  likes: LikeEntity[];

  @Expose()
  @Type(() => CommentEntity)
  comments: CommentEntity[];

  constructor(partial: Partial<RecipeEntity>) {
    Object.assign(this, partial);
  }
}
