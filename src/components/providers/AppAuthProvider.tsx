"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores";
import { wsClient } from "@/lib/api/websocket-native";
import { auth } from "@/lib/api/client";

interface AppAuthProviderProps {
  children: React.ReactNode;
}

export function AppAuthProvider({ children }: AppAuthProviderProps) {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  // Управление WebSocket подключением при монтировании (только один раз)
  useEffect(() => {
    // Проверяем токены при монтировании
    const tokens = auth.getTokens();
    console.log("AppAuthProvider - Current tokens:", tokens);

    if (tokens?.accessToken && !wsClient.isConnected()) {
      console.log("Valid token found, connecting WebSocket...");
      wsClient.connect();
    }
    // Запускаем только при монтировании компонента
  }, []);

  // Следим за изменениями аутентификации
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("User authenticated, connecting WebSocket...");
      // Небольшая задержка чтобы токены точно сохранились
      const timer = setTimeout(() => {
        if (!wsClient.isConnected()) {
          wsClient.connect();
        }
      }, 100);

      // Cleanup таймера
      return () => clearTimeout(timer);
    } else {
      console.log("User not authenticated, disconnecting WebSocket...");
      wsClient.disconnect();
    }

    // Cleanup при размонтировании
    return () => {
      // Не отключаем при размонтировании, только при выходе
    };
  }, [isAuthenticated, user]);

  // Логирование навигации (для аналитики)
  useEffect(() => {
    console.log(`Навигация: ${pathname}`);
  }, [pathname]);

  return <>{children}</>;
}
