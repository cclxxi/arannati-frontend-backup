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

export default function AccountButton({ className = "", isMobile = false, onMobileMenuClose }: AccountButtonProps) {
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
                className={`${isMobile ? "flex items-center justify-center" : "hidden md:flex items-center"} space-x-2 bg-brown dark:bg-brown-light text-white px-4 ${isMobile ? "py-3" : "py-2"} rounded-full transition-all duration-200 ease-out transform hover:bg-brown-light dark:hover:bg-brown hover:scale-105 hover:shadow-lg hover:-translate-y-0.5 ${isMobile ? "w-full" : ""} ${className}`}
                onClick={onMobileMenuClose}
            >
                <User className="w-5 h-5" />
                <span>Войти</span>
            </Link>
        );
    }

    // Mobile stays simple
    if (isMobile) {
        return (
            <div className={`space-y-2 w-full ${className}`}>
                <Link
                    href={getDashboardRoute()}
                    className="flex items-center justify-center space-x-2 bg-brown dark:bg-brown-light text-white px-4 py-3 rounded-full transition-all duration-200 ease-out transform hover:bg-brown-light dark:hover:bg-brown hover:scale-105 hover:shadow-lg w-full"
                    onClick={onMobileMenuClose}
                >
                    <User className="w-5 h-5" />
                    <span>{user?.firstName || "Аккаунт"}</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-2 bg-red-600 dark:bg-red-700 text-white px-4 py-3 rounded-full transition-all duration-200 ease-out transform hover:bg-red-700 dark:hover:bg-red-600 hover:scale-105 hover:shadow-lg w-full"
                    aria-label="Выйти"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Выйти</span>
                </button>
            </div>
        );
    }

    // --- Desktop with Tailwind-only transitions ---
    const bubble = 44; // px diameter for equal bubbles
    const gap = 12;   // px gap between bubbles

    return (
        <div
            className={`relative hidden md:inline-block ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Fixed-height stage to prevent vertical jitter; width grows with content */}
            <div className="relative" style={{ height: bubble }}>
                {/* Single state (icon + name). Absolutely centered to avoid y-shift */}
                <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-brown dark:bg-brown-light text-white pl-3 pr-4 py-2 rounded-full cursor-pointer shadow-sm transition-all duration-300 ease-out will-change-transform
            ${isHovered ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100 hover:bg-brown-light dark:hover:bg-brown hover:shadow-md"}
          `}
                    onClick={() => (window.location.href = getDashboardRoute())}
                    aria-label="Открыть аккаунт"
                >
                    <User className="w-5 h-5" />
                    <span className="whitespace-nowrap">{user?.firstName || "Аккаунт"}</span>
                </div>

                {/* Split state (two equal bubbles). Also centered vertically */}
                <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 flex items-center`}
                    style={{ gap }}
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

                {/* Make split state appear on keyboard focus as well */}
                <div className="sr-only">
                    <button onFocus={() => setIsHovered(true)} onBlur={() => setIsHovered(false)}>focus trap</button>
                </div>
            </div>
        </div>
    );
}
