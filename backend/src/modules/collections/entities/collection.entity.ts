import { Expose, Type } from 'class-transformer';
import { RecipeEntity } from '@/modules/recipes/entities/recipe.entity';
import { UserEntity } from '@/modules/users/entities/user.entity';

interface CollectionPartial {
  _count?: { recipes?: number; likes?: number };
  likes?: { userId: string }[];
  recipes?: { recipe: ConstructorParameters<typeof RecipeEntity>[0] }[];
  [key: string]: unknown;
}

export class CollectionEntity {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() slug: string;
  @Expose() description?: string;
  @Expose() coverImageUrl?: string;
  @Expose() isPublic: boolean;
  @Expose() createdAt: Date;
  @Expose() @Type(() => UserEntity) author: UserEntity;
  @Expose() recipeCount: number;
  @Expose() likesCount: number;
  @Expose() isLiked: boolean;
  @Expose() @Type(() => RecipeEntity) recipes?: RecipeEntity[];

  constructor(partial: CollectionPartial) {
    Object.assign(this, partial);
    this.recipeCount = partial._count?.recipes ?? partial.recipes?.length ?? 0;
    this.likesCount = partial._count?.likes ?? 0;
    this.isLiked = (partial.likes?.length ?? 0) > 0;
    this.recipes =
      partial.recipes?.map((cr) => new RecipeEntity(cr.recipe)) ?? undefined;
  }
}
