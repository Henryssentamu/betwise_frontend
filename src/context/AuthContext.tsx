import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiClient, UserProfile, LoginPayload, SignupPayload } from "../lib/api";

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasActiveSubscription: boolean | null;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  deleteAccount: (password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateRiskAppetite: (tier: "low" | "medium" | "high") => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // null = not yet known; false = known and inactive; true = known and active.
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!apiClient.isAuthenticated()) {
      setUser(null);
      setHasActiveSubscription(null);
      setIsLoading(false);
      return;
    }
    try {
      const [profileRes, subRes] = await Promise.all([
        apiClient.getProfile(),
        apiClient.getMySubscription(),
      ]);
      setUser(profileRes.data);
      setHasActiveSubscription(subRes.data !== null);
    } catch {
      apiClient.clearTokens();
      setUser(null);
      setHasActiveSubscription(null);
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
    setHasActiveSubscription(false);
  }, []);

  const logout = useCallback(() => {
    apiClient.clearTokens();
    setUser(null);
    setHasActiveSubscription(null);
  }, []);

  const deleteAccount = useCallback(async (password: string) => {
    await apiClient.deleteAccount(password);
    apiClient.clearTokens();
    setUser(null);
    setHasActiveSubscription(null);
  }, []);

  const updateRiskAppetite = useCallback(async (tier: "low" | "medium" | "high") => {
    const res = await apiClient.updateProfile({ default_risk_appetite: tier });
    setUser(res.data);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        hasActiveSubscription,
        login,
        signup,
        logout,
        deleteAccount,
        refreshProfile,
        updateRiskAppetite,
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
