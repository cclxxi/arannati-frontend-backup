"use client";

import React, { useEffect } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useThemeStore } from "@/stores";

interface ThemeProviderProps {
  children: React.ReactNode;
}

declare global {
  interface Window {
    __themeCleanup?: () => void;
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { resolvedTheme, initializeTheme } = useThemeStore();

  // Инициализация темы при монтировании
  useEffect(() => {
    initializeTheme();

    // Cleanup при размонтировании
    return () => {
      if (typeof window !== "undefined" && window.__themeCleanup) {
        window.__themeCleanup();
        delete window.__themeCleanup;
      }
    };
  }, [initializeTheme]);

  // Ant Design тема в зависимости от выбранной темы
  const algorithm =
    resolvedTheme === "dark"
      ? antdTheme.darkAlgorithm
      : antdTheme.defaultAlgorithm;

  const token = {
    colorPrimary: resolvedTheme === "dark" ? "#FF4081" : "#E91E63",
    colorLink: resolvedTheme === "dark" ? "#FF4081" : "#E91E63",
    colorSuccess: "#4CAF50",
    colorWarning: "#FFC107",
    colorError: "#F44336",
    colorInfo: "#2196F3",
    borderRadius: 8,
    colorBgContainer: resolvedTheme === "dark" ? "#16213e" : "#ffffff",
    colorBgElevated: resolvedTheme === "dark" ? "#1a1a2e" : "#ffffff",
    colorText: resolvedTheme === "dark" ? "#E1BEE7" : "#212121",
    colorTextSecondary: resolvedTheme === "dark" ? "#BDBDBD" : "#757575",
  };

  return (
    <ConfigProvider
      theme={{
        algorithm,
        token,
        components: {
          Button: {
            primaryShadow: "0 2px 0 rgba(0, 0, 0, 0.02)",
          },
          Card: {
            boxShadow:
              resolvedTheme === "dark"
                ? "0 1px 2px 0 rgba(0, 0, 0, 0.5)"
                : "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
