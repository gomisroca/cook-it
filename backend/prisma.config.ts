import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const isBuild = !process.env.DATABASE_URL;

export default defineConfig({
  schema: isBuild ? 'src/prisma/schema.prisma' : 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
  migrations: {
    path: isBuild ? 'src/prisma/migrations' : 'prisma/migrations',
  },
});
