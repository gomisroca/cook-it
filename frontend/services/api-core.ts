import axios, { AxiosInstance } from "axios";
import { env } from "@/env";

const API_URL = env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function createBaseApi(): AxiosInstance {
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.data) {
        return Promise.reject(error.response.data);
      }
      return Promise.reject(error);
    },
  );

  return api;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function unwrap<T>(promise: Promise<any>): Promise<T> {
  const res = await promise;
  const body = res.data ?? res;

  if (body && typeof body === "object" && "data" in body) {
    return body.data as T;
  }
  return body as T;
}
