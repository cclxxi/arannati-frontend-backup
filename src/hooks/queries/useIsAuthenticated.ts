// src/hooks/queries/useIsAuthenticated.ts
import { useEffect } from "react";
import { useAuthStore } from "@/stores";
import { useCurrentUser } from "@/hooks";
import { auth } from "@/lib/api/client";

export function useIsAuthenticated() {
  const { user, isAuthenticated, setUser, setLoading } = useAuthStore();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();

  useEffect(() => {
    // Проверяем токен при монтировании
    const checkAuth = async () => {
      setLoading(true);

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
        setLoading(false);
      }
    };

    checkAuth();
  }, [currentUser, user, setUser, setLoading]);

  return {
    user,
    isAuthenticated,
    isLoading: isLoadingUser,
  };
}
