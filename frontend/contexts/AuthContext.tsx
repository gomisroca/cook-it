"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { post, setAuthToken } from "@/services/api";

interface User {
  id: string;
  username: string;
  email: string;
}

interface LoginPayload {
  access_token: string;
}

enum Role {
  USER,
  ADMIN,
}

interface JwtPayload {
  id: string;
  username: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = jwtDecode<JwtPayload>(token);

      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return null;
      }

      setAuthToken(token);
      return {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
      };
    } catch {
      localStorage.removeItem("token");
      return null;
    }
  });

  const login = async (email: string, password: string) => {
    const res = await post<LoginPayload>("/auth/login", {
      email,
      password,
    });
    const token = res.access_token;
    localStorage.setItem("token", token);
    setAuthToken(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
  };

  const register = async (
    username: string,
    email: string,
    password: string,
  ) => {
    await post("/auth/register", { username, email, password });
    await login(email, password);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
