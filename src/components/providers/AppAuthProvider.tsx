"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores";
import { wsClient } from "@/lib/api/websocket-native";
import { auth } from "@/lib/api";

interface AppAuthProviderProps {
  children: React.ReactNode;
}

export function AppAuthProvider({ children }: AppAuthProviderProps) {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (isAuthenticated && user) {
        // Ensure we actually have a valid token before connecting
        const token = await auth.ensureValidToken();
        if (cancelled) return;

        if (token) {
          console.log("User authenticated, connecting WebSocket...");
          await wsClient.connect();
        } else {
          console.log("No valid token available, skipping WebSocket connect");
          wsClient.disconnect();
        }
      } else {
        console.log("User not authenticated, disconnecting WebSocket...");
        wsClient.disconnect();
      }
    };

    run()
      .then(() => run())
      .catch((e) => console.error("Error during WebSocket connection:", e));

    return () => {
      cancelled = true;
      wsClient.disconnect();
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    console.log(`Navigation: ${pathname}`);
  }, [pathname]);

  return <>{children}</>;
}
