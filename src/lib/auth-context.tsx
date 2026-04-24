"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthUser, getAccountByEmail } from "./auth-mock";

interface AuthCtx {
  user:    AuthUser | null;
  login:   (user: AuthUser) => void;
  logout:  () => void;
  loading: boolean;
}

const Ctx = createContext<AuthCtx>({
  user: null, login: () => {}, logout: () => {}, loading: true,
});

const STORAGE_KEY = "pantaudesa_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const login = (u: AuthUser) => {
    setUser(u);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return <Ctx.Provider value={{ user, login, logout, loading }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
