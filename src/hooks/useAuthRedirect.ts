import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useIsAuthenticated } from "@/hooks";
import { APP_ROUTES, USER_ROLES } from "@/constants";

interface UseAuthRedirectOptions {
  redirectIfAuthenticated?: boolean;
  redirectTo?: string;
}

export function useAuthRedirect(options: UseAuthRedirectOptions = {}) {
  const { redirectIfAuthenticated = false, redirectTo } = options;

  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, isLoading } = useIsAuthenticated();

  useEffect(() => {
    if (isLoading) return;

    // Редирект авторизованных пользователей
    if (redirectIfAuthenticated && isAuthenticated && user) {
      // Проверяем callbackUrl
      const callbackUrl = searchParams.get("callbackUrl");

      if (
        callbackUrl &&
        !callbackUrl.includes("login") &&
        !callbackUrl.includes("register")
      ) {
        router.push(callbackUrl);
        return;
      }

      // Редирект по умолчанию в зависимости от роли
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        switch (user.role) {
          case USER_ROLES.ADMIN:
            router.push(APP_ROUTES.admin.dashboard);
            break;
          case USER_ROLES.COSMETOLOGIST:
            router.push(APP_ROUTES.cosmetologist.dashboard);
            break;
          default:
            router.push(APP_ROUTES.user.dashboard);
        }
      }
    }

    // Редирект неавторизованных
    if (!redirectIfAuthenticated && !isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(
        `${APP_ROUTES.auth.login}?callbackUrl=${encodeURIComponent(currentPath)}`,
      );
    }
  }, [
    isAuthenticated,
    user,
    isLoading,
    redirectIfAuthenticated,
    redirectTo,
    router,
    searchParams,
  ]);

  return {
    isRedirecting: isLoading,
  };
}
