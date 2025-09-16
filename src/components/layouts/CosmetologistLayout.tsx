"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Star,
  FileText,
  Package,
  TrendingUp,
  Settings,
} from "lucide-react";
import type { MenuProps } from "antd";
import { DashboardLayoutBase } from "./DashboardLayoutBase";
import { APP_ROUTES } from "@/constants";

interface CosmetologistLayoutProps {
  children: React.ReactNode;
}

export function CosmetologistLayout({ children }: CosmetologistLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems: MenuProps["items"] = [
    {
      key: APP_ROUTES.cosmetologist.dashboard,
      icon: <LayoutDashboard size={20} />,
      label: "Главная",
      onClick: () => router.push(APP_ROUTES.cosmetologist.dashboard),
    },
    {
      key: APP_ROUTES.cosmetologist.catalog,
      icon: <ShoppingCart size={20} />,
      label: "Каталог",
      onClick: () => router.push(APP_ROUTES.cosmetologist.catalog),
    },
    {
      key: "/cosmetologist/orders",
      icon: <Package size={20} />,
      label: "Мои заказы",
      onClick: () => router.push("/cosmetologist/orders"),
    },
    {
      key: "/cosmetologist/statistics",
      icon: <TrendingUp size={20} />,
      label: "Статистика",
      onClick: () => router.push("/cosmetologist/statistics"),
    },
    {
      key: APP_ROUTES.cosmetologist.reviews,
      icon: <Star size={20} />,
      label: "Отзывы",
      onClick: () => router.push(APP_ROUTES.cosmetologist.reviews),
    },
    {
      key: APP_ROUTES.cosmetologist.materials,
      icon: <FileText size={20} />,
      label: "Материалы",
      onClick: () => router.push(APP_ROUTES.cosmetologist.materials),
    },
    { type: "divider" },
    {
      key: "/cosmetologist/settings",
      icon: <Settings size={20} />,
      label: "Настройки",
      onClick: () => router.push("/cosmetologist/settings"),
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
