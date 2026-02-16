import { Expose } from 'class-transformer';

export class FavoriteEntity {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  createdAt: Date;

  constructor(partial: Partial<FavoriteEntity>) {
    Object.assign(this, partial);
  }
}
