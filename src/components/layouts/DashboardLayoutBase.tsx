"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu as MenuIcon, X, Bell, ChevronDown } from "lucide-react";
import { Button, Dropdown, Badge, Avatar } from "antd";
import { MenuProps, Menu } from "antd";
import { Logo, ThemeToggle } from "@/components/ui";
import { cn } from "@/utils/common";
import { useLogout } from "@/hooks";
import { useAuth } from "@/hooks/queries/useAuth";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardLayoutBaseProps {
  children: React.ReactNode;
  menuItems: MenuProps["items"];
  title?: string;
  brandColor?: string;
}

export function DashboardLayoutBase({
  children,
  menuItems,
  title = "Dashboard",
  brandColor = "primary",
}: DashboardLayoutBaseProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { logout, isLoading: isLoggingOut } = useLogout();

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Профиль",
      onClick: () => router.push("/dashboard/profile"),
    },
    {
      key: "settings",
      label: "Настройки",
      onClick: () => router.push("/dashboard/settings"),
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Выйти",
      danger: true,
      onClick: () => logout(),
      disabled: isLoggingOut,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 bg-${brandColor}/10 rounded-full blur-3xl`}
        />
        <div
          className={`absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl`}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 dark:to-white/5" />
      </div>

      {/* Mobile menu backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-300 lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-border/50",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border/50">
            <Logo size="md" />
            <Button
              type="text"
              icon={<X size={24} />}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <Menu
              mode="inline"
              selectedKeys={[pathname]}
              items={menuItems}
              className="border-none bg-transparent"
              style={{
                background: "transparent",
              }}
            />
          </nav>

          {/* User info */}
          <div className="border-t border-border/50 p-4">
            <div className="flex items-center gap-3">
              <Avatar
                size={40}
                className={`bg-${brandColor} text-white font-semibold`}
              >
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-text-secondary truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-b border-border/50">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Button
                type="text"
                icon={<MenuIcon size={24} />}
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden"
              />
              <h1 className="text-xl font-semibold text-text-primary">
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />

              <Badge count={5} size="small">
                <Button type="text" icon={<Bell size={20} />} />
              </Badge>

              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <Button type="text" className="flex items-center gap-2 px-3">
                  <Avatar size={32} className={`bg-${brandColor} text-white`}>
                    {user?.firstName?.charAt(0)}
                  </Avatar>
                  <ChevronDown size={16} />
                </Button>
              </Dropdown>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="relative min-h-[calc(100vh-4rem)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
