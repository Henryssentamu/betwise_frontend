import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiClient, UserProfile, LoginPayload, SignupPayload } from "../lib/api";

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!apiClient.isAuthenticated()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await apiClient.getProfile();
      setUser(res.data);
    } catch {
      apiClient.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await apiClient.login(payload);
    apiClient.setTokens(res.data.access, res.data.refresh);
    await refreshProfile();
  }, [refreshProfile]);

  const signup = useCallback(async (payload: SignupPayload) => {
    const res = await apiClient.signup(payload);
    apiClient.setTokens(res.data.access, res.data.refresh);
    setUser(res.data.profile);
  }, []);

  const logout = useCallback(() => {
    apiClient.clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
