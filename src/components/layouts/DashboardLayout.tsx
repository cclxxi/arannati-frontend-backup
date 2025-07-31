"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  ShoppingBag,
  MessageSquare,
  Heart,
  Settings,
} from "lucide-react";
import type { MenuProps } from "antd";
import { DashboardLayoutBase } from "./DashboardLayoutBase";
import { APP_ROUTES } from "@/constants";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  const menuItems: MenuProps["items"] = [
    {
      key: APP_ROUTES.user.dashboard,
      icon: <LayoutDashboard size={20} />,
      label: "Главная",
      onClick: () => (window.location.href = APP_ROUTES.user.dashboard),
    },
    {
      key: APP_ROUTES.user.profile,
      icon: <User size={20} />,
      label: "Профиль",
      onClick: () => (window.location.href = APP_ROUTES.user.profile),
    },
    {
      key: APP_ROUTES.user.orders,
      icon: <ShoppingBag size={20} />,
      label: "Мои заказы",
      onClick: () => (window.location.href = APP_ROUTES.user.orders),
    },
    {
      key: APP_ROUTES.user.messages,
      icon: <MessageSquare size={20} />,
      label: "Сообщения",
      onClick: () => (window.location.href = APP_ROUTES.user.messages),
    },
    {
      key: APP_ROUTES.user.wishlist,
      icon: <Heart size={20} />,
      label: "Избранное",
      onClick: () => (window.location.href = APP_ROUTES.user.wishlist),
    },
    { type: "divider" },
    {
      key: "/dashboard/settings",
      icon: <Settings size={20} />,
      label: "Настройки",
      onClick: () => (window.location.href = "/dashboard/settings"),
    },
  ];

  const getPageTitle = () => {
    switch (pathname) {
      case APP_ROUTES.user.dashboard:
        return "Главная";
      case APP_ROUTES.user.profile:
        return "Мой профиль";
      case APP_ROUTES.user.orders:
        return "Мои заказы";
      case APP_ROUTES.user.messages:
        return "Сообщения";
      case APP_ROUTES.user.wishlist:
        return "Избранное";
      case "/dashboard/settings":
        return "Настройки";
      default:
        return "Dashboard";
    }
  };

  return (
    <DashboardLayoutBase
      menuItems={menuItems}
      title={getPageTitle()}
      brandColor="primary"
    >
      {children}
    </DashboardLayoutBase>
  );
}
