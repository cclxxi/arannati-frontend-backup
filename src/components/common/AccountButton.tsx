"use client";

import React, { useState } from "react";
import { User, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks";
import { APP_ROUTES, USER_ROLES } from "@/lib/constants";

interface AccountButtonProps {
  className?: string;
  isMobile?: boolean;
  onMobileMenuClose?: () => void;
}

export default function AccountButton({
  className = "",
  isMobile = false,
  onMobileMenuClose,
}: AccountButtonProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const getDashboardRoute = () => {
    if (!user?.role) return APP_ROUTES.user.dashboard;
    switch (user.role) {
      case USER_ROLES.ADMIN:
        return APP_ROUTES.admin.dashboard;
      case USER_ROLES.COSMETOLOGIST:
        return APP_ROUTES.cosmetologist.dashboard;
      case USER_ROLES.USER:
      default:
        return APP_ROUTES.user.dashboard;
    }
  };

  const handleLogout = () => {
    logout();
    onMobileMenuClose?.();
  };

  // Not authenticated → login pill
  if (!isAuthenticated) {
    return (
      <Link
        href={APP_ROUTES.auth.login}
        className={`${isMobile ? "flex items-center justify-center" : "hidden md:flex items-center"} space-x-2 bg-brown dark:bg-brown-light text-white px-3 ${isMobile ? "py-2" : "py-2"} rounded-full transition-all duration-200 ease-out transform hover:bg-brown-light dark:hover:bg-brown hover:scale-105 hover:shadow-lg hover:-translate-y-0.5 ${isMobile ? "text-sm" : ""} ${className}`}
        onClick={onMobileMenuClose}
      >
        <User className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`} />
        <span>Войти</span>
      </Link>
    );
  }

  // Mobile stays simple
  if (isMobile) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Link
          href={getDashboardRoute()}
          className="flex items-center space-x-2 bg-brown dark:bg-brown-light text-white px-3 py-2 rounded-full transition-all duration-200 ease-out transform hover:bg-brown-light dark:hover:bg-brown hover:scale-105 hover:shadow-lg text-sm"
          onClick={onMobileMenuClose}
        >
          <User className="w-4 h-4" />
          <span>{user?.firstName || "Аккаунт"}</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-red-600 dark:bg-red-700 text-white px-3 py-2 rounded-full transition-all duration-200 ease-out transform hover:bg-red-700 dark:hover:bg-red-600 hover:scale-105 hover:shadow-lg text-sm"
          aria-label="Выйти"
        >
          <LogOut className="w-4 h-4" />
          <span>Выйти</span>
        </button>
      </div>
    );
  }

  // --- Desktop with Tailwind-only transitions (no absolute overlay) ---
  const bubble = 44; // px diameter for equal bubbles
  const gap = 12; // px gap between bubbles

  return (
    <div
      className={`hidden md:inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Grid overlays both states in the same cell and reserves width for the split state
          so nothing overlaps adjacent header items (e.g., burger). */}
      <div
        className="grid place-items-center"
        style={{
          height: bubble,
          // Reserve space equal to the split width (2 bubbles + gap)
          minWidth: `calc(${bubble * 2}px + ${gap}px)`,
        }}
      >
        {/* Single state (icon + name) */}
        <div
          className={`col-start-1 row-start-1 justify-self-start flex items-center gap-2 bg-brown dark:bg-brown-light text-white pl-3 pr-4 py-2 rounded-full cursor-pointer shadow-sm transition-all duration-300 ease-out will-change-transform
            ${isHovered ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100 hover:bg-brown-light dark:hover:bg-brown hover:shadow-md"}
          `}
          onClick={() => (window.location.href = getDashboardRoute())}
          aria-label="Открыть аккаунт"
        >
          <User className="w-5 h-5" />
          <span className="truncate max-w-28 md:max-w-40">
            {user?.firstName || "Аккаунт"}
          </span>
        </div>

        {/* Split state (two equal bubbles) */}
        <div
          className={`col-start-1 row-start-1 justify-self-start flex items-center`}
          style={{ columnGap: gap }}
        >
          <div
            className={`transition-all duration-300 ease-out will-change-transform
              ${isHovered ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 -translate-x-2 pointer-events-none"}
            `}
          >
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Выйти"
              className="grid place-items-center rounded-full bg-red-600 dark:bg-red-700 text-white shadow-sm hover:shadow-md hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
              style={{ width: bubble, height: bubble }}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <div
            className={`transition-all duration-300 ease-out will-change-transform
              ${isHovered ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 translate-x-2 pointer-events-none"}
            `}
          >
            <Link
              href={getDashboardRoute()}
              aria-label="Открыть дашборд"
              className="grid place-items-center rounded-full bg-brown dark:bg-brown-light text-white shadow-sm hover:shadow-md hover:bg-brown-light dark:hover:bg-brown focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brown/50"
              style={{ width: bubble, height: bubble }}
            >
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
