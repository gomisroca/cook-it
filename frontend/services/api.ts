import { env } from "@/env";
import axios from "axios";

const API_URL = env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.response.use(
  (response) => {
    // If the server follows { status: 'success', data: {...} } pattern
    if (
      response.data &&
      response.data.status === "success" &&
      "data" in response.data
    ) {
      return response.data.data; // unwrap the inner data
    }
    return response.data; // fallback: just return whatever the server returned
  },
  (error) => {
    // Optional: unwrap error responses too
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  },
);

export async function get<T = unknown>(url: string): Promise<T> {
  return api.get<T>(url) as Promise<T>;
}

export async function post<T = unknown>(
  url: string,
  body?: unknown,
): Promise<T> {
  return api.post<T>(url, body) as Promise<T>;
}

export async function patch<T = unknown>(
  url: string,
  body?: unknown,
): Promise<T> {
  return api.patch<T>(url, body) as Promise<T>;
}

export async function apiDelete<T = unknown>(url: string): Promise<T> {
  return api.delete<T>(url) as Promise<T>;
}

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export default api;
