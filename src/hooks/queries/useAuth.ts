import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/services/auth";
import { queryKeys } from "@/lib/react-query/keys";
import Cookies from "js-cookie";

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
        return null;
      }

      try {
        const response = await authApi.getMe();
        return response;
      } catch {
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
      // Сохраняем токены
      if (data.accessToken) {
        Cookies.set("accessToken", data.accessToken, { expires: 7 });
      }
      if (data.refreshToken) {
        Cookies.set("refreshToken", data.refreshToken, { expires: 30 });
      }

      // Обновляем данные пользователя
      queryClient.setQueryData(queryKeys.auth.user(), data.user);

      // Перенаправляем на дашборд
      const redirectUrl =
        data.user?.role === "ADMIN"
          ? "/admin"
          : data.user?.role === "COSMETOLOGIST"
            ? "/cosmetologist"
            : "/dashboard";

      router.push(redirectUrl);
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

      // Перенаправляем на главную
      router.push("/");
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
