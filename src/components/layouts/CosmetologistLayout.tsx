"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Star,
  FileText,
  Package,
  TrendingUp,
  Settings,
  MessageSquare,
} from "lucide-react";
import type { MenuProps } from "antd";
import { DashboardLayoutBase } from "./DashboardLayoutBase";
import { APP_ROUTES } from "@/constants";

interface CosmetologistLayoutProps {
  children: React.ReactNode;
}

export function CosmetologistLayout({ children }: CosmetologistLayoutProps) {
  const pathname = usePathname();

  const menuItems: MenuProps["items"] = [
    {
      key: APP_ROUTES.cosmetologist.dashboard,
      icon: <LayoutDashboard size={20} />,
      label: "Главная",
      onClick: () =>
        (window.location.href = APP_ROUTES.cosmetologist.dashboard),
    },
    {
      key: APP_ROUTES.cosmetologist.catalog,
      icon: <ShoppingCart size={20} />,
      label: "Каталог",
      onClick: () => (window.location.href = APP_ROUTES.cosmetologist.catalog),
    },
    {
      key: "/cosmetologist/orders",
      icon: <Package size={20} />,
      label: "Мои заказы",
      onClick: () => (window.location.href = "/cosmetologist/orders"),
    },
    {
      key: "/cosmetologist/statistics",
      icon: <TrendingUp size={20} />,
      label: "Статистика",
      onClick: () => (window.location.href = "/cosmetologist/statistics"),
    },
    {
      key: APP_ROUTES.cosmetologist.reviews,
      icon: <Star size={20} />,
      label: "Отзывы",
      onClick: () => (window.location.href = APP_ROUTES.cosmetologist.reviews),
    },
    {
      key: APP_ROUTES.cosmetologist.materials,
      icon: <FileText size={20} />,
      label: "Материалы",
      onClick: () =>
        (window.location.href = APP_ROUTES.cosmetologist.materials),
    },
    {
      key: APP_ROUTES.cosmetologist.messages,
      icon: <MessageSquare size={20} />,
      label: "Сообщения",
      onClick: () => (window.location.href = APP_ROUTES.cosmetologist.messages),
    },
    { type: "divider" },
    {
      key: "/cosmetologist/settings",
      icon: <Settings size={20} />,
      label: "Настройки",
      onClick: () => (window.location.href = "/cosmetologist/settings"),
    },
  ];

  const getPageTitle = () => {
    switch (pathname) {
      case APP_ROUTES.cosmetologist.dashboard:
        return "Главная";
      case APP_ROUTES.cosmetologist.catalog:
        return "Каталог для косметологов";
      case "/cosmetologist/orders":
        return "Мои заказы";
      case "/cosmetologist/statistics":
        return "Статистика покупок";
      case APP_ROUTES.cosmetologist.reviews:
        return "Отзывы клиентов";
      case APP_ROUTES.cosmetologist.materials:
        return "Обучающие материалы";
      case APP_ROUTES.cosmetologist.messages:
        return "Сообщения";
      case "/cosmetologist/settings":
        return "Настройки";
      default:
        return "Кабинет косметолога";
    }
  };

  return (
    <DashboardLayoutBase
      menuItems={menuItems}
      title={getPageTitle()}
      brandColor="secondary"
    >
      {children}
    </DashboardLayoutBase>
  );
}
