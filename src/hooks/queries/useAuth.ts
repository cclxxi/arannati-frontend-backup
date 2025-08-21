// src/hooks/quries/useAuth.ts
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { auth as authUtils } from "@/lib/api/client";

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
    setUser,
    clearAuth,
  } = useAuthStore();

  // Проверяем авторизацию при монтировании
  useEffect(() => {
    if (authUtils.isAuthenticated() && !user) {
      checkAuth();
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
    setUser,
    clearAuth,
  };
}

// Export for backward compatibility if it was used elsewhere
export default useAuth;
