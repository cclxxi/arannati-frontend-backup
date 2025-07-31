import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auth } from "@/lib/api/client";
import { authApi } from "@/lib/api/services/auth";
import { getUserFromToken } from "@/lib/utils/jwt";
import { queryKeys } from "@/lib/react-query/keys";
import { useAuthStore } from "@/stores";
import type { UserDTO } from "@/types/api";
import type {
  LoginInput,
  RegisterInput,
  CosmetologistRegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/lib/utils/validation";
import { APP_ROUTES, USER_ROLES } from "@/lib/constants";

interface AuthState {
  user: UserDTO | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Проверка аутентификации при загрузке
  useEffect(() => {
    (async () => {
      try {
        const tokens = auth.getTokens();

        if (!tokens?.accessToken) {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
          return;
        }

        // Получаем пользователя из токена
        const userFromToken = getUserFromToken(tokens.accessToken);

        if (!userFromToken) {
          auth.removeTokens();
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
          return;
        }

        // Получаем полную информацию о пользователе с сервера
        const user = await authApi.getMe();

        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error("Auth check failed:", error);
        auth.removeTokens();
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    })();
  }, []);

  // Функция входа
  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });

      setAuthState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
      });

      return response;
    } catch (error) {
      throw error;
    }
  };

  // Функция выхода
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      router.push("/login");
    }
  };

  // Функция обновления данных пользователя
  const updateUser = (user: UserDTO) => {
    setAuthState((prev) => ({
      ...prev,
      user,
    }));
  };

  return {
    ...authState,
    login,
    logout,
    updateUser,
  };
}

// Hook для получения текущего пользователя
export function useCurrentUser() {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: async () => {
      try {
        return await authApi.getMe();
      } catch (error) {
        console.error("Failed to fetch user:", error);
        throw error;
      }
    },
    enabled: auth.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  return { user, isLoading, error, data: user };
}

// Hook для входа в систему
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: setAuthUser } = useAuthStore();

  const mutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      return await authApi.login(data);
    },
    onSuccess: async (response) => {
      // Обновляем кэш пользователя
      queryClient.setQueryData(queryKeys.auth.user(), response.user);
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });

      // Обновляем состояние аутентификации в store
      setAuthUser(response.user);

      // Проверяем callbackUrl из query params
      const callbackUrl = searchParams.get("callbackUrl");

      if (
        callbackUrl &&
        !callbackUrl.includes("login") &&
        !callbackUrl.includes("register") &&
        !callbackUrl.includes("logout")
      ) {
        router.push(callbackUrl);
        return;
      }

      // Редирект по умолчанию в зависимости от роли
      switch (response.user.role) {
        case USER_ROLES.ADMIN:
          router.push(APP_ROUTES.admin.dashboard);
          break;
        case USER_ROLES.COSMETOLOGIST:
          router.push(APP_ROUTES.cosmetologist.dashboard);
          break;
        default:
          router.push(APP_ROUTES.user.dashboard);
      }
    },
  });

  return {
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

// Hook для регистрации
export function useRegister() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (data: RegisterInput) => {
      return await authApi.register(data);
    },
    onSuccess: () => {
      // После успешной регистрации перенаправляем на страницу входа
      router.push("/login?registered=true");
    },
  });

  return {
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

// Hook для регистрации косметолога
export function useRegisterCosmetologist() {
  const mutation = useMutation({
    mutationFn: async (data: CosmetologistRegisterInput) => {
      // Just pass the data object directly to the API service
      // The API service will handle FormData creation and proper multipart structure
      return await authApi.registerCosmetologist(data);
    },
  });

  return {
    registerCosmetologist: mutation.mutate,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    mutate: mutation.mutate,
  };
}

// Hook для выхода из системы
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { logout: logoutFromStore } = useAuthStore();

  const mutation = useMutation({
    mutationFn: async () => {
      return await authApi.logout();
    },
    onSuccess: () => {
      // Очищаем кэш пользователя
      queryClient.removeQueries({ queryKey: queryKeys.auth.user() });

      // Обновляем состояние аутентификации в store
      logoutFromStore();

      // Редирект на страницу входа
      router.push("/login");
    },
  });

  return {
    logout: mutation.mutate,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

// Hook для запроса восстановления пароля
export function useForgotPassword() {
  const mutation = useMutation({
    mutationFn: async (data: ForgotPasswordInput) => {
      return await authApi.forgotPassword(data);
    },
  });

  return {
    forgotPassword: mutation.mutate,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    mutate: mutation.mutate,
  };
}

// Hook для сброса пароля
export function useResetPassword() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (params: {
      token: string;
      password: string;
      confirmPassword: string;
    }) => {
      const { token, ...data } = params;
      return await authApi.resetPassword(token, data as ResetPasswordInput);
    },
    onSuccess: () => {
      // После успешного сброса пароля перенаправляем на страницу входа
      router.push("/login?reset=success");
    },
  });

  return {
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

// Hook для проверки аутентификации
export function useIsAuthenticated() {
  const { data: user, isLoading } = useCurrentUser();
  const { user: storeUser, isAuthenticated: storeIsAuthenticated } =
    useAuthStore();

  // Проверяем аутентификацию как через API, так и через store
  const isAuthenticated =
    (!!user && auth.isAuthenticated()) || storeIsAuthenticated;

  // Используем пользователя из API или из store
  const authenticatedUser = user || storeUser;

  return { isAuthenticated, isLoading, user: authenticatedUser };
}

// Hook для проверки роли пользователя
export function useHasRole(
  roles: (keyof typeof USER_ROLES)[] | keyof typeof USER_ROLES,
) {
  const { user, isLoading, isAuthenticated } = useIsAuthenticated();

  // Проверяем, является ли roles массивом
  const roleArray = Array.isArray(roles) ? roles : [roles];

  // Проверяем, имеет ли пользователь хотя бы одну из указанных ролей
  const hasRole =
    !isLoading &&
    isAuthenticated &&
    !!user &&
    roleArray.some((role) => user.role === USER_ROLES[role]);

  return { hasRole, isLoading };
}
