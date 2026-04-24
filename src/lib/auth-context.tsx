"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthUser } from "./auth-mock";

interface AuthCtx {
  user:    AuthUser | null;
  login:   (user: AuthUser) => void;
  logout:  () => void;
  loading: boolean;
}

const Ctx = createContext<AuthCtx>({
  user: null, login: () => {}, logout: () => {}, loading: true,
});

const KEY = "pantaudesa_user";

function revive(raw: string): AuthUser {
  const parsed = JSON.parse(raw);
  // Restore Date fields that JSON.parse turns into strings
  if (parsed.joinedAt) parsed.joinedAt = new Date(parsed.joinedAt);
  return parsed as AuthUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setUser(revive(raw));
    } catch {}
    setLoading(false);
  }, []);

  const login = (u: AuthUser) => {
    setUser(u);
    sessionStorage.setItem(KEY, JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(KEY);
  };

  return <Ctx.Provider value={{ user, login, logout, loading }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
