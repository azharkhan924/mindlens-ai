"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  ageRange?: string;
  wellnessGoals?: string[];
  createdAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  ageRange?: string;
  wellnessGoals?: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await fetchApi("/auth/me");
      setUser(data);
    } catch {
      logout();
    }
  }, [logout]);

  // On mount, check for existing token
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      // Verify token is still valid
      fetchApi("/auth/me")
        .then((data) => {
          setUser(data);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // Listen for 401 events from the API client
  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [logout]);

  const login = async (email: string, password: string) => {
    const data = await fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser({
      id: data.id,
      email: data.email,
      name: data.name,
      ageRange: data.ageRange,
      wellnessGoals: data.wellnessGoals,
    });
  };

  const register = async (registerData: RegisterData) => {
    const data = await fetchApi("/auth/register", {
      method: "POST",
      body: JSON.stringify(registerData),
    });
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser({
      id: data.id,
      email: data.email,
      name: data.name,
      ageRange: data.ageRange,
      wellnessGoals: data.wellnessGoals,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
