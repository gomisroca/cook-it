import { Role } from '@/generated/prisma/enums';
import { Exclude, Expose } from 'class-transformer';

export class UserEntity {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  role: Role;

  @Exclude()
  createdAt: Date;

  @Exclude()
  password?: string | null;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
