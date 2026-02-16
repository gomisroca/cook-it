import { UserEntity } from '@/modules/users/entities/user.entity';
import { Expose, Type } from 'class-transformer';

export class CommentEntity {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  userId: string;

  @Expose()
  recipeId: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => UserEntity)
  user?: UserEntity;

  constructor(partial: Partial<CommentEntity>) {
    Object.assign(this, partial);
  }
}
