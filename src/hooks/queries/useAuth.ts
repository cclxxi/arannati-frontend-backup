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
        return null; // Возвращаем null вместо undefined
      }

      try {
        const response = await authApi.getMe();
        return response || null; // Гарантируем что не вернется undefined
      } catch {
        // Если токен невалидный, очищаем его
        Cookies.remove("accessToken");
        Cookies.remove("auth-token");
        Cookies.remove("refreshToken");
        return null; // Возвращаем null вместо undefined
      }
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: false,
    // ВАЖНОЕ ИЗМЕНЕНИЕ: обрабатываем undefined
    select: (data) => data ?? null, // Преобразуем undefined в null
  });

  // Логин
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      console.log("[useAuth] Login successful:", {
        email: data.user?.email,
        role: data.user?.role,
      });

      // Обновляем данные пользователя в кэше
      queryClient.setQueryData(queryKeys.auth.user(), data.user || null);

      // Определяем URL для редиректа на основе роли
      let redirectUrl = "/dashboard";

      const userRole = data.user?.role;

      switch (userRole) {
        case USER_ROLES.ADMIN:
        case "ADMIN":
          redirectUrl = APP_ROUTES.admin.dashboard;
          break;

        case USER_ROLES.COSMETOLOGIST:
        case "COSMETOLOGIST":
          redirectUrl = APP_ROUTES.cosmetologist.dashboard;
          break;

        case USER_ROLES.USER:
        case "USER":
          redirectUrl = APP_ROUTES.user.dashboard;
          break;
      }

      toast.success(
        `Добро пожаловать, ${data.user?.firstName || data.user?.email}!`,
      );

      setTimeout(() => {
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
      try {
        await authApi.logout();
      } catch {
        // Игнорируем ошибки при логауте
      }
    },
    onSettled: () => {
      // Очищаем токены
      Cookies.remove("accessToken");
      Cookies.remove("auth-token");
      Cookies.remove("refreshToken");

      // Очищаем кэш
      queryClient.clear();

      toast.success("Вы успешно вышли из системы");
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
    user: user ?? null, // Гарантируем null вместо undefined
    isLoading,
    isAuthenticated: !!user,
    error,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    hasRole,
    hasAnyRole,
    role: user?.role,
    isAdmin: hasRole(USER_ROLES.ADMIN),
    isCosmetologist: hasRole(USER_ROLES.COSMETOLOGIST),
    isUser: hasRole(USER_ROLES.USER),
  };
}
