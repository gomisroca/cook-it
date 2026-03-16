import { Role } from '@/generated/prisma/enums';

export interface JwtUser {
  id: string;
  email: string;
  username: string;
  role: Role;
}
