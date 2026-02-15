import { Exclude, Expose } from 'class-transformer';

export class UserEntity {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name?: string | null;

  @Expose()
  role: string;

  @Expose()
  createdAt: Date;

  @Exclude()
  password?: string | null;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
