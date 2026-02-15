"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { get, post, setAuthToken } from "@/services/api";

interface User {
  id: string;
  username: string;
  email: string;
}

interface LoginPayload {
  access_token: string;
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
  const [user, setUser] = useState<User | null>(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
      get<User>("/users/me")
        .then((res) => setUser(res))
        .catch(() => setUser(null));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await post<LoginPayload>("/auth/login", {
      email,
      password,
    });
    const token = res.access_token;
    localStorage.setItem("token", token);
    setAuthToken(token);
    const user = await get<User>("/users/me");
    setUser(user);
  };

  const register = async (
    username: string,
    email: string,
    password: string,
  ) => {
    await post("/auth/register", { username, email, password });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
