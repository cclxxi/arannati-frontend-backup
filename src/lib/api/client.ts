import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { config } from "@/lib/config";
import { handleApiError, isAuthError /*, showError*/ } from "@/lib/utils/error";
import { STORAGE_KEYS } from "@/lib/constants";
import Cookies from "js-cookie";

// Типы для аутентификации
interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Создаем instance Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Флаг для предотвращения множественных запросов на обновление токена
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Функция для подписки на обновление токена
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Функция для оповещения всех подписчиков
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Функция для получения токенов
const getAuthTokens = (): AuthTokens | null => {
  const accessToken = Cookies.get(STORAGE_KEYS.AUTH_TOKEN);
  const refreshToken = Cookies.get(STORAGE_KEYS.REFRESH_TOKEN);

  if (!accessToken) return null;

  return { accessToken, refreshToken };
};

// Функция для сохранения токенов
const setAuthTokens = (tokens: AuthTokens) => {
  Cookies.set(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken, {
    expires: 1, // 1 день
    secure: config.isProduction,
    sameSite: "strict",
  });

  if (tokens.refreshToken) {
    Cookies.set(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken, {
      expires: 7, // 7 дней
      secure: config.isProduction,
      sameSite: "strict",
    });
  }
};

// Функция для удаления токенов
const removeAuthTokens = () => {
  Cookies.remove(STORAGE_KEYS.AUTH_TOKEN);
  Cookies.remove(STORAGE_KEYS.REFRESH_TOKEN);
};

// Функция для обновления токена
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const tokens = getAuthTokens();
    if (!tokens?.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post<RefreshTokenResponse>(
      `${config.api.baseUrl}/auth/refresh`,
      { refreshToken: tokens.refreshToken },
    );

    const newTokens: AuthTokens = {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    };

    setAuthTokens(newTokens);
    return newTokens.accessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    removeAuthTokens();
    window.location.href = "/login";
    return null;
  }
};

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Получаем токен для каждого запроса
    const tokens = getAuthTokens();

    if (tokens?.accessToken) {
      // Пока используем Basic Auth (потом переключимся на Bearer)
      const basicAuth = btoa(`${tokens.accessToken}:`);
      config.headers.Authorization = `Basic ${basicAuth}`;

      // Для будущего JWT:
      // config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Если ошибка 401 и это не запрос на обновление токена
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        !isAuthError(error) ||
        originalRequest.url?.includes("/auth/refresh")
      ) {
        removeAuthTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        const newToken = await refreshAccessToken();
        isRefreshing = false;

        if (newToken) {
          onTokenRefreshed(newToken);

          // Повторяем оригинальный запрос с новым токеном
          const basicAuth = btoa(`${newToken}:`);
          originalRequest.headers.Authorization = `Basic ${basicAuth}`;
          return apiClient(originalRequest);
        }
      } else {
        // Если уже идет обновление токена, подписываемся на результат
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            const basicAuth = btoa(`${token}:`);
            originalRequest.headers.Authorization = `Basic ${basicAuth}`;
            resolve(apiClient(originalRequest));
          });
        });
      }
    }

    // Обрабатываем ошибку
    handleApiError(error);
    return Promise.reject(error);
  },
);

// Экспортируем функции для работы с токенами
export const auth = {
  setTokens: setAuthTokens,
  getTokens: getAuthTokens,
  removeTokens: removeAuthTokens,
  isAuthenticated: () => !!getAuthTokens()?.accessToken,
};

export default apiClient;
