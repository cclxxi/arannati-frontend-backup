"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores";
import { wsClient } from "@/api/websocket-native";

interface AppAuthProviderProps {
  children: React.ReactNode;
}

export function AppAuthProvider({ children }: AppAuthProviderProps) {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  // Управление WebSocket подключением
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("User authenticated, connecting WebSocket...");
      // Small delay to ensure auth tokens are ready
      setTimeout(() => {
        wsClient.connect();
      }, 100);
    } else {
      console.log("User not authenticated, disconnecting WebSocket...");
      // Отключаем при выходе
      wsClient.disconnect();
    }

    // Cleanup при размонтировании
    return () => {
      wsClient.disconnect();
    };
  }, [isAuthenticated, user]);

  // Логирование навигации (для аналитики)
  useEffect(() => {
    console.log(`Navigation: ${pathname}`);
  }, [pathname]);

  return <>{children}</>;
}
