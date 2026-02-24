import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    UPLOADTHING_TOKEN: z.string(),
    JWT_SECRET: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  client: {
    NEXT_PUBLIC_UPLOADTHING_CDN: z.string(),
    NEXT_PUBLIC_API_URL: z.url().default("http://localhost:3001"),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_UPLOADTHING_CDN: process.env.NEXT_PUBLIC_UPLOADTHING_CDN,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    JWT_SECRET: process.env.JWT_SECRET,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
