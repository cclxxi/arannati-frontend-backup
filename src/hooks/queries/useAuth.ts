import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/keys";
import { showSuccess /*, showError*/ } from "@/utils/error";
import type {
  /* LoginInput,
    RegisterInput,
    CosmetologistRegisterInput,
    ForgotPasswordInput,*/
  ResetPasswordInput,
} from "@/utils/validation";
import type { UserDTO } from "@/types/api";
import { APP_ROUTES } from "@/constants";
// Hook для получения текущего пользователя
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: authApi.getMe,
    staleTime: Infinity, // Данные пользователя редко меняются
    retry: false, // Не повторяем при ошибке авторизации
  });
}

// Hook для входа в систему
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      // Сохраняем данные пользователя в кеш
      queryClient.setQueryData(queryKeys.auth.user(), data.user);

      // Инвалидируем все запросы
      await queryClient.invalidateQueries();

      showSuccess("Вы успешно вошли в систему");

      // Редирект в зависимости от роли
      switch (data.user.role) {
        case "ADMIN":
          router.push(APP_ROUTES.admin.dashboard);
          break;
        case "COSMETOLOGIST":
          router.push(APP_ROUTES.cosmetologist.dashboard);
          break;
        default:
          router.push(APP_ROUTES.user.dashboard);
      }
    },
  });
}

// Hook для регистрации
export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      showSuccess(
        "Регистрация прошла успешно! Теперь вы можете войти в систему",
      );
      router.push(APP_ROUTES.auth.login);
    },
  });
}

// Hook для регистрации косметолога
export function useRegisterCosmetologist() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.registerCosmetologist,
    onSuccess: () => {
      showSuccess(
        "Заявка отправлена! Мы проверим ваши документы и свяжемся с вами в течение 3 рабочих дней",
      );
      router.push(APP_ROUTES.auth.login);
    },
  });
}

// Hook для выхода из системы
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Очищаем весь кеш
      queryClient.clear();
      showSuccess("Вы вышли из системы");
    },
  });
}

// Hook для восстановления пароля
export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      showSuccess(
        "Инструкции по восстановлению пароля отправлены на вашу почту",
      );
    },
  });
}

// Hook для сброса пароля
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ token, ...data }: ResetPasswordInput & { token: string }) =>
      authApi.resetPassword(token, data),
    onSuccess: () => {
      showSuccess(
        "Пароль успешно изменен! Теперь вы можете войти с новым паролем",
      );
      router.push(APP_ROUTES.auth.login);
    },
  });
}

// Hook для проверки аутентификации
export function useIsAuthenticated() {
  const { data: user, isLoading } = useCurrentUser();

  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
}

// Hook для проверки роли
export function useHasRole(roles: Array<UserDTO["role"]>) {
  const { user } = useIsAuthenticated();

  return {
    hasRole: user ? roles.includes(user.role) : false,
    userRole: user?.role,
  };
}
