"use client";

import React, { useEffect } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import ruRU from "antd/locale/ru_RU";
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

  // Arannati brand colors for Ant Design
  const token = {
    // Primary brand colors
    colorPrimary: resolvedTheme === "dark" ? "#f7ecd0" : "#bc7426",
    colorPrimaryHover: resolvedTheme === "dark" ? "#efe9df" : "#905630",
    colorPrimaryActive: resolvedTheme === "dark" ? "#bc7426" : "#905630",

    // Secondary and accent colors
    colorLink: resolvedTheme === "dark" ? "#b2cec0" : "#bc7426",
    colorSuccess: "#b2cec0", // Mint
    colorWarning: "#f7ecd0", // Light beige
    colorError: resolvedTheme === "dark" ? "#ef6868" : "#dc2626",
    colorInfo: resolvedTheme === "dark" ? "#f7ecd0" : "#bc7426",

    // Border radius
    borderRadius: 8,

    // Background colors
    colorBgContainer: resolvedTheme === "dark" ? "#32443c" : "#ffffff",
    colorBgElevated: resolvedTheme === "dark" ? "#2a3a33" : "#ffffff",
    colorBgLayout: resolvedTheme === "dark" ? "#2a3a33" : "#efe9df",
    colorBgSpotlight: resolvedTheme === "dark" ? "#32443c" : "#f7ecd0",

    // Text colors
    colorText: resolvedTheme === "dark" ? "#efe9df" : "#2a3a33",
    colorTextSecondary: resolvedTheme === "dark" ? "#f7ecd0" : "#905630",
    colorTextTertiary: resolvedTheme === "dark" ? "#b2cec0" : "#bc7426",
    colorTextQuaternary: resolvedTheme === "dark" ? "#8fa599" : "#905630",

    // Border colors
    colorBorder: resolvedTheme === "dark" ? "#4a5f55" : "#e5ddd2",
    colorBorderSecondary: resolvedTheme === "dark" ? "#3e5349" : "#f0e9e0",

    // Font
    fontFamily:
      "'Proxima Nova', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  };

  const components = {
    Button: {
      primaryShadow: "0 2px 0 rgba(0, 0, 0, 0.02)",
      colorText: resolvedTheme === "dark" ? "#efe9df" : "#2a3a33",
      algorithm: true,
    },
    Card: {
      colorBgContainer: resolvedTheme === "dark" ? "#32443c" : "#ffffff",
      colorBorderSecondary: resolvedTheme === "dark" ? "#4a5f55" : "#e5ddd2",
      boxShadow:
        resolvedTheme === "dark"
          ? "0 1px 2px 0 rgba(0, 0, 0, 0.5)"
          : "0 1px 2px 0 rgba(42, 58, 51, 0.03), 0 1px 6px -1px rgba(42, 58, 51, 0.02), 0 2px 4px 0 rgba(42, 58, 51, 0.02)",
    },
    Input: {
      colorBgContainer: resolvedTheme === "dark" ? "#2a3a33" : "#ffffff",
      colorBorder: resolvedTheme === "dark" ? "#4a5f55" : "#d9d9d9",
      colorText: resolvedTheme === "dark" ? "#efe9df" : "#2a3a33",
      colorTextPlaceholder: resolvedTheme === "dark" ? "#6b7280" : "#905630",
      activeBorderColor: resolvedTheme === "dark" ? "#b2cec0" : "#bc7426",
      hoverBorderColor: resolvedTheme === "dark" ? "#b2cec0" : "#905630",
      algorithm: true,
    },
    Select: {
      colorBgContainer: resolvedTheme === "dark" ? "#2a3a33" : "#ffffff",
      colorBorder: resolvedTheme === "dark" ? "#4a5f55" : "#d9d9d9",
      colorText: resolvedTheme === "dark" ? "#efe9df" : "#2a3a33",
      colorBgElevated: resolvedTheme === "dark" ? "#32443c" : "#ffffff",
      controlItemBgActive: resolvedTheme === "dark" ? "#4a5f55" : "#f7ecd0",
      controlItemBgHover: resolvedTheme === "dark" ? "#3e5349" : "#efe9df",
      optionSelectedBg: resolvedTheme === "dark" ? "#4a5f55" : "#f7ecd0",
      algorithm: true,
    },
    Dropdown: {
      colorBgElevated: resolvedTheme === "dark" ? "#32443c" : "#ffffff",
      colorText: resolvedTheme === "dark" ? "#efe9df" : "#2a3a33",
      controlItemBgActive: resolvedTheme === "dark" ? "#4a5f55" : "#f7ecd0",
      controlItemBgHover: resolvedTheme === "dark" ? "#3e5349" : "#efe9df",
      algorithm: true,
    },
    Form: {
      labelColor: resolvedTheme === "dark" ? "#efe9df" : "#2a3a33",
      algorithm: true,
    },
    Menu: {
      colorBgContainer: resolvedTheme === "dark" ? "#2a3a33" : "#ffffff",
      itemSelectedBg: resolvedTheme === "dark" ? "#4a5f55" : "#f7ecd0",
      itemSelectedColor: resolvedTheme === "dark" ? "#b2cec0" : "#bc7426",
      algorithm: true,
    },
    Modal: {
      colorBgElevated: resolvedTheme === "dark" ? "#32443c" : "#ffffff",
      colorText: resolvedTheme === "dark" ? "#efe9df" : "#2a3a33",
      algorithm: true,
    },
    Table: {
      colorBgContainer: resolvedTheme === "dark" ? "#32443c" : "#ffffff",
      colorText: resolvedTheme === "dark" ? "#efe9df" : "#2a3a33",
      headerBg: resolvedTheme === "dark" ? "#2a3a33" : "#f7ecd0",
      headerColor: resolvedTheme === "dark" ? "#efe9df" : "#2a3a33",
      algorithm: true,
    },
  };

  return (
    <ConfigProvider
      locale={ruRU}
      theme={{
        algorithm,
        token,
        components,
      }}
    >
      {children}
    </ConfigProvider>
  );
}
