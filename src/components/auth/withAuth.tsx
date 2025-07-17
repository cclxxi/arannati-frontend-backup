"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
// import { useAuthStore } from '@/stores';
import { useIsAuthenticated } from "@/hooks";
import { PageLoading } from "@/components/ui";
// import { USER_ROLES } from '@/constants';

interface WithAuthOptions {
  roles?: string[];
  redirectTo?: string;
  fallback?: React.ComponentType;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {},
) {
  const {
    roles = [],
    redirectTo = "/login",
    fallback: Fallback = PageLoading,
  } = options;

  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useIsAuthenticated();

    useEffect(() => {
      // Если загрузка завершена, и пользователь не авторизован
      if (!isLoading && !isAuthenticated) {
        const callbackUrl = window.location.pathname;
        router.push(
          `${redirectTo}?callbackUrl=${encodeURIComponent(callbackUrl)}`,
        );
        return;
      }

      // Если пользователь авторизован, но нет нужной роли
      if (!isLoading && isAuthenticated && roles.length > 0 && user) {
        if (!roles.includes(user.role)) {
          router.push("/403");
        }
      }
    }, [isLoading, isAuthenticated, user, router]);

    // Показываем загрузку
    if (isLoading) {
      return <Fallback />;
    }

    // Если не авторизован или нет доступа, показываем fallback
    if (
      !isAuthenticated ||
      (roles.length > 0 && user && !roles.includes(user.role))
    ) {
      return <Fallback />;
    }

    // Все проверки пройдены, рендерим компонент
    return <Component {...props} />;
  };
}
