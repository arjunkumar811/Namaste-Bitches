"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SessionPayload } from "@/types/auth";
import { getSession, loginAnonymously, logoutAction, rerollIdentityAction, activateAdminAction } from "@/actions/auth.actions";

interface AuthContextType {
  user: SessionPayload | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  rerollIdentity: () => Promise<void>;
  activateAdmin: (passkey: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = async () => {
    setIsLoading(true);
    try {
      let session = await getSession();
      if (!session) {
        session = await loginAnonymously();
      }
      setUser(session);
    } catch (error) {
      console.error("Failed to initialize auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async () => {
    setIsLoading(true);
    try {
      const session = await loginAnonymously();
      setUser(session);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutAction();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const rerollIdentity = async () => {
    if (!user) return;
    try {
      const res = await rerollIdentityAction();
      if (res.success && res.identity) {
        setUser((prev) => prev ? { ...prev, ...res.identity! } : null);
      }
    } catch (error) {
      console.error("Failed to reroll identity:", error);
    }
  };

  const activateAdmin = async (passkey: string) => {
    if (!user) return { success: false, error: "Not logged in" };
    try {
      const res = await activateAdminAction(passkey);
      if (res.success) {
        setUser((prev) => prev ? { ...prev, isAdmin: true, username: "Admin", avatar: "🛡️", accentColor: "#10b981" } : null);
      }
      return res;
    } catch (error) {
      return { success: false, error: "Failed to activate Admin" };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, rerollIdentity, activateAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
