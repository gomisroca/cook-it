import { Expose } from 'class-transformer';

export class UserStatusEntity {
  @Expose()
  isFollowing: boolean;

  @Expose()
  isLiked: boolean;

  @Expose()
  isFavorited: boolean;

  constructor(partial: Partial<UserStatusEntity>) {
    Object.assign(this, partial);
  }
}
