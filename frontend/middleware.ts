import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { env } from "./env";

const PROTECTED_ROUTES = ["/recipes/create", "/recipes/:path*/edit"];

const secret = new TextEncoder().encode(env.JWT_SECRET);

async function verifyToken(token: string) {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!token || !(await verifyToken(token))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);

    const response = NextResponse.redirect(loginUrl);

    response.cookies.delete("token");

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: PROTECTED_ROUTES,
};
