import apiClient, { auth } from "@/lib/api/client";
import { API_ROUTES } from "@/constants";
import type {
  LoginInput,
  RegisterInput,
  CosmetologistRegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/lib/utils/validation";
import type { UserDTO } from "@/types/api";

// Типы ответов
interface LoginResponse {
  user: UserDTO;
  accessToken: string;
  refreshToken?: string;
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
    const response = await apiClient.post<LoginResponse>(
      API_ROUTES.auth.login,
      data,
    );

    // Сохраняем токены
    auth.setTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });

    return response.data;
  },

  // Регистрация обычного пользователя
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
  ): Promise<RegisterResponse> => {
    const formData = new FormData();

    // Добавляем данные в FormData
    const { diplomaFile, ...jsonData } = data;
    formData.append("data", JSON.stringify(jsonData));

    if (diplomaFile) {
      formData.append("diplomaFile", diplomaFile);
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

  // Выход из системы
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ROUTES.auth.logout);
    } finally {
      // Удаляем токены в любом случае
      auth.removeTokens();
      window.location.href = "/login";
    }
  },

  // Получение текущего пользователя
  getMe: async (): Promise<UserDTO> => {
    const response = await apiClient.get<UserDTO>(API_ROUTES.auth.me);
    return response.data;
  },

  // Запрос на восстановление пароля
  forgotPassword: async (
    data: ForgotPasswordInput,
  ): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(
      API_ROUTES.auth.forgotPassword,
      null,
      { params: data },
    );
    return response.data;
  },

  // Сброс пароля
  resetPassword: async (
    token: string,
    data: ResetPasswordInput,
  ): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(
      API_ROUTES.auth.resetPassword,
      null,
      {
        params: {
          token,
          ...data,
        },
      },
    );
    return response.data;
  },
};
