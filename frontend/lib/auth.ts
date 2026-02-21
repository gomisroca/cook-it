import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { env } from "@/env";
import { cache } from "react";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (typeof decoded === "string") return null; // safety check
    return decoded as User;
  } catch {
    return null;
  }
});
