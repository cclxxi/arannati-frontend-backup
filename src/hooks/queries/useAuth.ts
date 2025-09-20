// src/hooks/queries/useAuth.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/services/auth";
import { queryKeys } from "@/lib/react-query/keys";
import { APP_ROUTES, USER_ROLES } from "@/lib/constants";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Получение текущего пользователя
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: async () => {
      // Проверяем наличие токена
      const token = Cookies.get("accessToken") || Cookies.get("auth-token");
      if (!token) {
        console.log("[useAuth] No token found");
        return null;
      }

      try {
        console.log("[useAuth] Fetching current user");
        const response = await authApi.getMe();
        console.log("[useAuth] User data received:", {
          id: response?.id,
          email: response?.email,
          role: response?.role,
          role_id: response?.role_id,
        });
        return response;
      } catch (error) {
        console.error("[useAuth] Failed to fetch user:", error);
        // Если токен невалидный, очищаем его
        Cookies.remove("accessToken");
        Cookies.remove("auth-token");
        Cookies.remove("refreshToken");
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: false,
  });

  // Логин
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      console.log("[useAuth] Login successful:", {
        email: data.user?.email,
        role: data.user?.role,
        role_id: data.user?.role_id,
      });

      // Обновляем данные пользователя в кэше
      queryClient.setQueryData(queryKeys.auth.user(), data.user);

      // Определяем URL для редиректа на основе роли
      let redirectUrl = "/dashboard"; // По умолчанию

      const userRole = data.user?.role;
      console.log("[useAuth] Determining redirect for role:", userRole);

      // Проверяем роль и выполняем соответствующий редирект
      switch (userRole) {
        case USER_ROLES.ADMIN:
        case "ADMIN":
          redirectUrl = APP_ROUTES.admin.dashboard;
          console.log("[useAuth] Admin detected, redirecting to:", redirectUrl);
          break;

        case USER_ROLES.COSMETOLOGIST:
        case "COSMETOLOGIST":
          redirectUrl = APP_ROUTES.cosmetologist.dashboard;
          console.log(
            "[useAuth] Cosmetologist detected, redirecting to:",
            redirectUrl,
          );
          break;

        case USER_ROLES.USER:
        case "USER":
          redirectUrl = APP_ROUTES.user.dashboard;
          console.log(
            "[useAuth] Regular user detected, redirecting to:",
            redirectUrl,
          );
          break;

        default:
          console.warn(
            "[useAuth] Unknown role:",
            userRole,
            "- redirecting to default dashboard",
          );
          redirectUrl = APP_ROUTES.user.dashboard;
      }

      // Показываем уведомление об успешном входе
      toast.success(
        `Добро пожаловать, ${data.user?.firstName || data.user?.email}!`,
      );

      // Небольшая задержка перед редиректом для лучшего UX
      setTimeout(() => {
        console.log("[useAuth] Performing redirect to:", redirectUrl);
        router.push(redirectUrl);
      }, 100);
    },
    onError: (error: unknown) => {
      console.error("[useAuth] Login failed:", error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as Error)?.message ||
        "Ошибка при входе";
      toast.error(message);
    },
  });

  // Логаут
  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("[useAuth] Logging out");
      try {
        await authApi.logout();
      } catch (error) {
        console.error("[useAuth] Logout API error:", error);
        // Игнорируем ошибки при логауте
      }
    },
    onSettled: () => {
      console.log("[useAuth] Clearing auth data");

      // Очищаем токены
      Cookies.remove("accessToken");
      Cookies.remove("auth-token");
      Cookies.remove("refreshToken");

      // Очищаем кэш
      queryClient.clear();

      // Показываем уведомление
      toast.success("Вы успешно вышли из системы");

      // Перенаправляем на главную
      console.log("[useAuth] Redirecting to home");
      router.push("/");
    },
  });

  // Проверка роли пользователя
  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  // Проверка множественных ролей
  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role || "");
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    hasRole,
    hasAnyRole,
    // Для обратной совместимости
    role: user?.role,
    isAdmin: hasRole(USER_ROLES.ADMIN),
    isCosmetologist: hasRole(USER_ROLES.COSMETOLOGIST),
    isUser: hasRole(USER_ROLES.USER),
  };
}
