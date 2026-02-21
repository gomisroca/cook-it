import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    UPLOADTHING_TOKEN: z.string(),
    UPLOADTHING_CDN: z.string(),
    JWT_SECRET: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  client: {
    NEXT_PUBLIC_API_URL: z.url().default("http://localhost:3001"),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    UPLOADTHING_CDN: process.env.UPLOADTHING_CDN,
    JWT_SECRET: process.env.JWT_SECRET,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
