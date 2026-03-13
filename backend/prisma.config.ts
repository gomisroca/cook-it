import 'dotenv/config';
import { env, PrismaConfig } from 'prisma/config';

export default {
  schema: 'src/prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    path: 'src/prisma/migrations',
  },
} satisfies PrismaConfig;
