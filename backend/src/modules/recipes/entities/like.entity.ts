import { Expose } from 'class-transformer';

export class LikeEntity {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  createdAt: Date;

  constructor(partial: Partial<LikeEntity>) {
    Object.assign(this, partial);
  }
}
