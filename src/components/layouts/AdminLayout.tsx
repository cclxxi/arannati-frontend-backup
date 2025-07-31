"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Star,
  UserCheck,
  BarChart3,
  Settings,
  FileText,
} from "lucide-react";
import type { MenuProps } from "antd";
import { DashboardLayoutBase } from "./DashboardLayoutBase";
import { APP_ROUTES } from "@/constants";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  const menuItems: MenuProps["items"] = [
    {
      key: APP_ROUTES.admin.dashboard,
      icon: <LayoutDashboard size={20} />,
      label: "Главная",
      onClick: () => (window.location.href = APP_ROUTES.admin.dashboard),
    },
    {
      key: "users-section",
      icon: <Users size={20} />,
      label: "Пользователи",
      children: [
        {
          key: APP_ROUTES.admin.users,
          label: "Все пользователи",
          onClick: () => (window.location.href = APP_ROUTES.admin.users),
        },
        {
          key: APP_ROUTES.admin.cosmetologists,
          icon: <UserCheck size={16} />,
          label: "Косметологи",
          onClick: () =>
            (window.location.href = APP_ROUTES.admin.cosmetologists),
        },
      ],
    },
    {
      key: APP_ROUTES.admin.products,
      icon: <Package size={20} />,
      label: "Товары",
      onClick: () => (window.location.href = APP_ROUTES.admin.products),
    },
    {
      key: APP_ROUTES.admin.orders,
      icon: <ShoppingCart size={20} />,
      label: "Заказы",
      onClick: () => (window.location.href = APP_ROUTES.admin.orders),
    },
    {
      key: APP_ROUTES.admin.reviews,
      icon: <Star size={20} />,
      label: "Отзывы",
      onClick: () => (window.location.href = APP_ROUTES.admin.reviews),
    },
    {
      key: "/admin/analytics",
      icon: <BarChart3 size={20} />,
      label: "Аналитика",
      onClick: () => (window.location.href = "/admin/analytics"),
    },
    {
      key: "/admin/content",
      icon: <FileText size={20} />,
      label: "Контент",
      onClick: () => (window.location.href = "/admin/content"),
    },
    { type: "divider" },
    {
      key: "/admin/settings",
      icon: <Settings size={20} />,
      label: "Настройки",
      onClick: () => (window.location.href = "/admin/settings"),
    },
  ];

  const getPageTitle = () => {
    switch (pathname) {
      case APP_ROUTES.admin.dashboard:
        return "Панель управления";
      case APP_ROUTES.admin.users:
        return "Управление пользователями";
      case APP_ROUTES.admin.cosmetologists:
        return "Управление косметологами";
      case APP_ROUTES.admin.products:
        return "Управление товарами";
      case APP_ROUTES.admin.orders:
        return "Управление заказами";
      case APP_ROUTES.admin.reviews:
        return "Управление отзывами";
      case "/admin/analytics":
        return "Аналитика";
      case "/admin/content":
        return "Управление контентом";
      case "/admin/settings":
        return "Настройки системы";
      default:
        return "Администрирование";
    }
  };

  return (
    <DashboardLayoutBase
      menuItems={menuItems}
      title={getPageTitle()}
      brandColor="error"
    >
      {children}
    </DashboardLayoutBase>
  );
}
