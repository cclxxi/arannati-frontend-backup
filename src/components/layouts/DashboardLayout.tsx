"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Heart,
  Settings,
  ShoppingCart,
  Package,
} from "lucide-react";
import type { MenuProps } from "antd";
import { Badge } from "antd";
import { DashboardLayoutBase } from "./DashboardLayoutBase";
import { APP_ROUTES } from "@/constants";
import { useCartItems, useWishlistItems } from "@/hooks";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: cartItems = [] } = useCartItems();
  const { data: wishlistItems = [] } = useWishlistItems();
  
  // Calculate counts from hook data like in dropdown components
  const cartCount = Array.isArray(cartItems) ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const wishlistCount = Array.isArray(wishlistItems) ? wishlistItems.length : 0;

  const menuItems: MenuProps["items"] = [
    {
      key: APP_ROUTES.user.dashboard,
      icon: <LayoutDashboard size={20} />,
      label: "Личный кабинет",
      onClick: () => router.push(APP_ROUTES.user.dashboard),
    },
    {
      key: "/cart",
      icon: (
        <Badge count={cartCount} size="small" offset={[10, 0]}>
          <ShoppingCart size={20} />
        </Badge>
      ),
      label: "Корзина",
      onClick: () => router.push("/cart"),
    },
    {
      key: "/wishlist",
      icon: (
        <Badge count={wishlistCount} size="small" offset={[10, 0]}>
          <Heart size={20} />
        </Badge>
      ),
      label: "Избранное",
      onClick: () => router.push("/wishlist"),
    },
    {
      key: APP_ROUTES.user.orders,
      icon: <Package size={20} />,
      label: "Мои заказы",
      onClick: () => router.push(APP_ROUTES.user.orders),
    },
    {
      key: APP_ROUTES.user.messages,
      icon: <MessageSquare size={20} />,
      label: "Сообщения",
      onClick: () => router.push(APP_ROUTES.user.messages),
    },
    { type: "divider" },
    {
      key: "/dashboard/settings",
      icon: <Settings size={20} />,
      label: "Настройки",
      onClick: () => router.push("/dashboard/settings"),
    },
  ];

  const getPageTitle = () => {
    switch (pathname) {
      case APP_ROUTES.user.dashboard:
        return "Главная";
      case "/cart":
        return "Корзина";
      case "/wishlist":
        return "Избранное";
      case APP_ROUTES.user.orders:
        return "Мои заказы";
      case APP_ROUTES.user.messages:
        return "Сообщения";
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
