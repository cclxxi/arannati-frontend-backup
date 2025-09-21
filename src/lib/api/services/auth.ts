// src/lib/api/services/auth.ts
import apiClient from "@/lib/api/client";
import { API_ROUTES } from "@/lib/constants";
import { getCleanToken } from "@/lib/utils/jwt";
import Cookies from "js-cookie";
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  CosmetologistRegisterInput,
} from "@/lib/utils/validation";
import type { UserDTO } from "@/types/api";

// Типы ответов
interface LoginResponse {
  user: UserDTO & {
    role?: string;
    role_id?: number;
  };
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  message?: string;
}

interface RegisterResponse {
  user: UserDTO;
  message: string;
}

interface MessageResponse {
  message: string;
  success: boolean;
}

// API методы
export const authApi = {
  // Вход в систему
  login: async (data: LoginInput): Promise<LoginResponse> => {
    try {
      console.log("[Auth API] Login attempt for:", data.email);

      const response = await apiClient.post<LoginResponse>(
        API_ROUTES.auth.login,
        data,
      );

      console.log("[Auth API] Raw login response:", response.data);

      const responseData = response.data;

      // Извлекаем токены из разных возможных мест
      let accessToken = responseData.accessToken || responseData.token;
      const refreshToken = responseData.refreshToken;

      // Если токен с префиксом Bearer, сохраняем чистый токен
      if (accessToken) {
        accessToken = getCleanToken(accessToken);
        console.log("[Auth API] Extracted clean token, saving to cookies");
      }

      // Извлекаем пользователя с ролью
      const user = responseData.user;

      // Логируем информацию о роли для отладки
      console.log("[Auth API] User role info:", {
        role: user?.role,
        role_id: user?.role_id,
        email: user?.email,
      });

      // Сохраняем токены в cookies
      if (accessToken) {
        Cookies.set("accessToken", accessToken, {
          expires: 7,
          secure: window.location.protocol === "https:",
          sameSite: "lax",
        });
        console.log("[Auth API] Access token saved to cookies");
      }

      if (refreshToken) {
        Cookies.set("refreshToken", refreshToken, {
          expires: 30,
          secure: window.location.protocol === "https:",
          sameSite: "lax",
        });
        console.log("[Auth API] Refresh token saved to cookies");
      }

      return {
        user,
        accessToken,
        refreshToken,
        message: responseData.message,
      };
    } catch (error) {
      console.error("[Auth API] Login error:", error);
      throw error;
    }
  },

  // Получение текущего пользователя
  getMe: async (): Promise<UserDTO & { role?: string; role_id?: number }> => {
    try {
      // Проверяем наличие токена перед запросом
      const token = Cookies.get("accessToken");
      console.log("[Auth API] Getting current user, token exists:", !!token);

      if (!token) {
        console.error("[Auth API] No token found for /me request");
        throw new Error("No authentication token");
      }

      console.log("[Auth API] Making request to /api/auth/me with token");

      const response = await apiClient.get<
        | {
            user?: UserDTO & { role?: string; role_id?: number };
          }
        | (UserDTO & { role?: string; role_id?: number })
      >(API_ROUTES.auth.me);

      console.log("[Auth API] Raw /me response:", response.data);

      // Обрабатываем разные форматы ответа
      let user: UserDTO & { role?: string; role_id?: number };

      if (response.data && "user" in response.data && response.data.user) {
        // Если ответ обернут в объект с полем user
        user = response.data.user;
      } else if (response.data && "id" in response.data) {
        // Если ответ - это сам пользователь
        user = response.data as UserDTO & { role?: string; role_id?: number };
      } else {
        console.error(
          "[Auth API] Invalid response format from /me:",
          response.data,
        );
        throw new Error("Invalid response format");
      }

      console.log("[Auth API] Current user info:", {
        id: user?.id,
        email: user?.email,
        role: user?.role,
        role_id: user?.role_id,
      });

      return user;
    } catch (error) {
      console.error("[Auth API] Failed to get current user:", error);

      // Если 401, очищаем токены
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        (error.message === "Unauthorized" ||
          error.message === "No authentication token")
      ) {
        console.log("[Auth API] Clearing invalid tokens");
        Cookies.remove("accessToken");
        Cookies.remove("auth-token");
        Cookies.remove("refreshToken");
      }

      throw error;
    }
  },

  // Регистрация
  register: async (data: RegisterInput): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>(
      API_ROUTES.auth.register,
      data,
    );
    return response.data;
  },

  // Регистрация косметолога
  registerCosmetologist: async (
    data: CosmetologistRegisterInput,
    diplomaFile?: File,
    certificateFile?: File,
  ): Promise<RegisterResponse> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    if (diplomaFile) {
      formData.append("diploma", diplomaFile);
    }

    if (certificateFile) {
      formData.append("certificate", certificateFile);
    }

    const response = await apiClient.post<RegisterResponse>(
      API_ROUTES.auth.registerCosmetologist,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  // Восстановление пароля
  forgotPassword: async (
    data: ForgotPasswordInput,
  ): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(
      API_ROUTES.auth.forgotPassword,
      null,
      {
        params: { email: data.email },
      },
    );
    return response.data;
  },

  // Сброс пароля
  resetPassword: async (data: ResetPasswordInput): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(
      API_ROUTES.auth.resetPassword,
      null,
      {
        params: {
          token: data.token,
          newPassword: data.password,
        },
      },
    );
    return response.data;
  },

  // Выход из системы
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ROUTES.auth.logout);
    } catch (error) {
      console.error("[Auth API] Logout error:", error);
      // Игнорируем ошибки при логауте
    } finally {
      // Всегда очищаем токены
      Cookies.remove("accessToken");
      Cookies.remove("auth-token");
      Cookies.remove("refreshToken");
      console.log("[Auth API] Tokens cleared");
    }
  },

  // Обновление токена
  refreshToken: async (): Promise<{ accessToken: string }> => {
    const refreshToken = Cookies.get("refreshToken");

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post<{ accessToken: string }>(
      API_ROUTES.auth.refresh,
      { refreshToken },
    );

    const { accessToken } = response.data;

    // Сохраняем новый токен
    if (accessToken) {
      const cleanToken = getCleanToken(accessToken);
      Cookies.set("accessToken", cleanToken, {
        expires: 7,
        secure: window.location.protocol === "https:",
        sameSite: "lax",
      });
    }

    return response.data;
  },
};
