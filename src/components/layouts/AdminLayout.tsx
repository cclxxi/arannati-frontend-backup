"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, Menu, Avatar, Dropdown, Badge } from "antd";
import type { MenuProps } from "antd";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Star,
  Settings,
  LogOut,
  Menu as MenuIcon,
  X,
  Bell,
  User,
  UserCheck,
} from "lucide-react";
import { useAuthStore, useUIStore } from "@/stores";
import { useLogout } from "@/hooks";
import { Button, ThemeToggle, StatusBadge } from "@/components/ui";
import { APP_ROUTES } from "@/constants";
import { cn } from "@/utils/common";

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems: MenuProps["items"] = [
  {
    key: APP_ROUTES.admin.dashboard,
    icon: <LayoutDashboard size={20} />,
    label: <Link href={APP_ROUTES.admin.dashboard}>Главная</Link>,
  },
  {
    key: APP_ROUTES.admin.users,
    icon: <Users size={20} />,
    label: <Link href={APP_ROUTES.admin.users}>Пользователи</Link>,
  },
  {
    key: APP_ROUTES.admin.cosmetologists,
    icon: <UserCheck size={20} />,
    label: <Link href={APP_ROUTES.admin.cosmetologists}>Косметологи</Link>,
  },
  {
    key: APP_ROUTES.admin.products,
    icon: <ShoppingBag size={20} />,
    label: <Link href={APP_ROUTES.admin.products}>Товары</Link>,
  },
  {
    key: APP_ROUTES.admin.orders,
    icon: <Package size={20} />,
    label: <Link href={APP_ROUTES.admin.orders}>Заказы</Link>,
  },
  {
    key: APP_ROUTES.admin.reviews,
    icon: <Star size={20} />,
    label: <Link href={APP_ROUTES.admin.reviews}>Отзывы</Link>,
  },
  {
    type: "divider",
  },
  {
    key: `${APP_ROUTES.admin.dashboard}/settings`,
    icon: <Settings size={20} />,
    label: (
      <Link href={`${APP_ROUTES.admin.dashboard}/settings`}>Настройки</Link>
    ),
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const logout = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <User size={16} />,
      label: (
        <Link href={`${APP_ROUTES.admin.dashboard}/settings`}>Профиль</Link>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogOut size={16} />,
      label: "Выйти",
      onClick: () => logout.logout(),
    },
  ];

  return (
    <Layout className="min-h-screen">
      {/* Мобильное меню */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      <Sider
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        breakpoint="lg"
        collapsedWidth={80}
        width={256}
        className={cn(
          "fixed left-0 top-0 h-full z-50 transition-transform duration-300",
          "lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
        theme="dark"
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          <Link href="/" className="text-2xl font-bold text-white">
            {sidebarCollapsed ? "A" : "Arannati Admin"}
          </Link>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          className="border-none"
        />
      </Sider>

      <Layout
        className={cn(
          "transition-all duration-300",
          "lg:ml-[256px]",
          sidebarCollapsed && "lg:ml-[80px]",
        )}
      >
        <Header className="bg-white dark:bg-gray-800 px-4 lg:px-6 flex items-center justify-between shadow-sm">
          <Button
            type="text"
            icon={mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden"
          />

          <div className="flex items-center gap-2">
            <StatusBadge status="error" text="Администратор" />
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <Badge count={5} size="small">
              <Button type="text" icon={<Bell size={20} />} />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar size={40} className="bg-red-500">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </Avatar>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Администратор
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="p-4 lg:p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
