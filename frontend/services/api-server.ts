import "server-only";
import { cookies } from "next/headers";
import { createBaseApi, unwrap } from "./api-core";

async function createServerApi() {
  const api = createBaseApi();
  const cookieStore = await cookies();
  api.defaults.headers.Cookie = cookieStore.toString();
  return api;
}

export async function get<T = unknown>(url: string): Promise<T> {
  const api = await createServerApi();
  return unwrap<T>(api.get<T>(url));
}

export async function post<T = unknown>(
  url: string,
  body?: unknown,
): Promise<T> {
  const api = await createServerApi();
  return unwrap<T>(api.post<T>(url, body));
}

export async function patch<T = unknown>(
  url: string,
  body?: unknown,
): Promise<T> {
  const api = await createServerApi();
  return unwrap<T>(api.patch<T>(url, body));
}

export async function del<T = unknown>(url: string): Promise<T> {
  const api = await createServerApi();
  return unwrap<T>(api.delete<T>(url));
}
