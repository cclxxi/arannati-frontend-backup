// src/hooks/queries/useIsAuthenticated.ts
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores";
import { useAuth } from "@/hooks";
import { auth } from "@/lib/api/client";

export function useIsAuthenticated() {
  const {
    user,
    isAuthenticated,
    setUser,
    isLoading: storeLoading,
  } = useAuthStore();
  const { user: currentUser, isLoading: isLoadingUser } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    // Проверяем токен при монтировании
    const checkAuth = async () => {
      setLocalLoading(true);

      try {
        // Проверяем наличие валидного токена
        if (auth.isAuthenticated()) {
          // Если пользователь не загружен в store, но токен есть
          if (!user && currentUser) {
            setUser(currentUser);
          }
        } else {
          // Если токен невалидный, очищаем состояние
          setUser(null);
        }
      } finally {
        setLocalLoading(false);
      }
    };

    checkAuth();
  }, [currentUser, user, setUser]);

  return {
    user,
    isAuthenticated,
    isLoading: localLoading || storeLoading || isLoadingUser,
  };
}
