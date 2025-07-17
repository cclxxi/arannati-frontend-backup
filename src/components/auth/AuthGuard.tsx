"use client";

import { useIsAuthenticated, useHasRole } from "@/hooks";
import type { UserDTO } from "@/types/api";
import React from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  requireRoles?: Array<UserDTO["role"]>;
  requireVerified?: boolean;
}

export function AuthGuard({
  children,
  fallback = null,
  requireAuth = true,
  requireRoles = [],
  requireVerified = false,
}: AuthGuardProps) {
  const { isAuthenticated, user } = useIsAuthenticated();
  const { hasRole } = useHasRole(requireRoles);

  // Проверка авторизации
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  // Проверка ролей
  if (requireRoles.length > 0 && !hasRole) {
    return <>{fallback}</>;
  }

  // Проверка верификации
  if (requireVerified && user && !user.verified) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
