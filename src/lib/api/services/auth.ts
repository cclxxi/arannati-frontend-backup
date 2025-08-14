import apiClient, { auth } from "@/lib/api/client";
import { API_ROUTES } from "@/constants";
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
  user: UserDTO;
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  message?: string;
  data?: {
    user?: UserDTO;
    token?: string;
    accessToken?: string;
    refreshToken?: string;
  };
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

    console.log("Login response:", response.data);

    // Spring Boot возвращает данные в другом формате
    // Проверяем разные варианты ответа
    const responseData = response.data;

    // Извлекаем токены из разных возможных мест
    let accessToken =
      responseData.accessToken ||
      responseData.token ||
      responseData.data?.token ||
      responseData.data?.accessToken;

    const refreshToken =
      responseData.refreshToken || responseData.data?.refreshToken;

    // Извлекаем пользователя
    const user =
      responseData.user || responseData.data?.user || responseData.data;

    // Если токен в заголовке Authorization
    if (!accessToken && responseData.message?.includes("Bearer")) {
      const match = responseData.message.match(/Bearer\s+(\S+)/);
      if (match) {
        accessToken = match[1];
      }
    }

    // Если токен уже с префиксом Bearer, убираем его
    if (accessToken?.startsWith("Bearer ")) {
      accessToken = accessToken.substring(7);
    }

    if (!accessToken) {
      console.error("No access token in response:", responseData);
      throw new Error("No access token received");
    }

    console.log("Extracted tokens:", { accessToken, refreshToken });

    // Сохраняем токены
    auth.setTokens({
      accessToken,
      refreshToken,
    });

    // Формируем правильный ответ
    return {
      user,
      accessToken,
      refreshToken,
    };
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

    // Extract the diploma file and confirmPassword
    const { diplomaFile, ...registrationData } = data;

    // Add the JSON data as a Blob with a proper content type for the 'data' part
    const jsonBlob = new Blob([JSON.stringify(registrationData)], {
      type: "application/json",
    });
    formData.append("data", jsonBlob);

    // Add the diploma file as the 'diplomaFile' part
    if (diplomaFile) {
      formData.append("diplomaFile", diplomaFile);
    }

    const response = await apiClient.post<RegisterResponse>(
      API_ROUTES.auth.registerCosmetologist,
      formData,
      {
        headers: {
          // Don't set Content-Type manually - let the browser set it with boundary
        },
      },
    );
    return response.data;
  },

  // Выход из системы
  logout: async (): Promise<void> => {
    try {
      await apiClient.post<void>(API_ROUTES.auth.logout);
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
