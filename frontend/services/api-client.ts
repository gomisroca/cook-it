"use client";
import { createBaseApi, unwrap } from "./api-core";

const api = createBaseApi();
api.defaults.withCredentials = true;

export async function get<T = unknown>(url: string): Promise<T> {
  return unwrap<T>(api.get<T>(url));
}

export async function post<T = unknown>(
  url: string,
  body?: unknown,
): Promise<T> {
  return unwrap<T>(api.post<T>(url, body));
}

export async function patch<T = unknown>(
  url: string,
  body?: unknown,
): Promise<T> {
  return unwrap<T>(api.patch<T>(url, body));
}

export async function del<T = unknown>(url: string): Promise<T> {
  return unwrap<T>(api.delete<T>(url));
}
