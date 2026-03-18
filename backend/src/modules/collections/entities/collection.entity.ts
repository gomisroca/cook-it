import { Expose, Type } from 'class-transformer';
import { RecipeEntity } from '@/modules/recipes/entities/recipe.entity';
import { UserEntity } from '@/modules/users/entities/user.entity';

export class CollectionEntity {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() slug: string;
  @Expose() description?: string;
  @Expose() isPublic: boolean;
  @Expose() createdAt: Date;
  @Expose() @Type(() => UserEntity) author: UserEntity;
  @Expose() recipeCount: number;
  @Expose() @Type(() => RecipeEntity) recipes?: RecipeEntity[];

  constructor(partial: any) {
    Object.assign(this, partial);
    this.recipeCount = partial._count?.recipes ?? partial.recipes?.length ?? 0;
    this.recipes =
      partial.recipes?.map((cr: any) => new RecipeEntity(cr.recipe)) ??
      undefined;
  }
}
