"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores";
import { wsClient } from "@/api/websocket";

interface AppAuthProviderProps {
  children: React.ReactNode;
}

export function AppAuthProvider({ children }: AppAuthProviderProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  // Управление WebSocket подключением
  useEffect(() => {
    if (isAuthenticated) {
      // Подключаем WebSocket при авторизации
      wsClient.connect();
    } else {
      // Отключаем при выходе
      wsClient.disconnect();
    }

    // Cleanup при размонтировании
    return () => {
      wsClient.disconnect();
    };
  }, [isAuthenticated]);

  // Логирование навигации (для аналитики)
  useEffect(() => {
    console.log(`Навигация: ${pathname}`);
  }, [pathname]);

  return <>{children}</>;
}
