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

  // Управление WebSocket подключением
  useEffect(() => {
    console.log("AppAuthProvider - Auth state:", { isAuthenticated, user });

    // Проверяем токены при монтировании
    const tokens = auth.getTokens();
    console.log("AppAuthProvider - Current tokens:", tokens);

    if (tokens?.accessToken && !wsClient.isConnected()) {
      console.log("Valid token found, connecting WebSocket...");
      wsClient.connect();
    } else if (!tokens?.accessToken && wsClient.isConnected()) {
      console.log("No valid token, disconnecting WebSocket...");
      wsClient.disconnect();
    }
  }, []);

  // Следим за изменениями аутентификации
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("User authenticated, connecting WebSocket...");
      // Небольшая задержка чтобы токены точно сохранились
      setTimeout(() => {
        if (!wsClient.isConnected()) {
          wsClient.connect();
        }
      }, 100);
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
