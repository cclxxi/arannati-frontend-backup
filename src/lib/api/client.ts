import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { config } from "@/lib/config";
import { handleApiError } from "@/lib/utils/error";
import { STORAGE_KEYS, API_ROUTES } from "@/lib/constants";
import Cookies from "js-cookie";
import { getUserFromToken, isTokenExpired } from "@/lib/utils/jwt";

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
  headers: {},
});

apiClient.interceptors.request.use(
  (config) => {
    // Only set JSON content type if data is not FormData
    if (config.data && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    // For FormData, don't set Content-Type - let browser handle it

    return config;
  },
  (error) => Promise.reject(error),
);

// Флаг для предотвращения множественных запросов на обновление токена
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Функция для подписки на обновление токена
export const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Функция для оповещения всех подписчиков
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const stripBearer = (value?: string): string | undefined => {
  if (!value) return undefined;
  return value.replace(/^Bearer\s+/i, "").trim();
};

// Функция для получения токенов
const getAuthTokens = (): AuthTokens | null => {
  const accessTokenRaw = Cookies.get(STORAGE_KEYS.AUTH_TOKEN);
  const refreshTokenRaw = Cookies.get(STORAGE_KEYS.REFRESH_TOKEN);

  const accessToken = stripBearer(accessTokenRaw);
  const refreshToken = stripBearer(refreshTokenRaw);

  if (!accessToken) return null;
  return { accessToken, refreshToken };
};

// Функция для сохранения токенов
const setAuthTokens = (tokens: AuthTokens) => {
  const cookieOptions = {
    secure: config.isProduction,
    sameSite: "strict" as const,
    path: "/",
  };

  const access = stripBearer(tokens.accessToken)!;
  Cookies.set(STORAGE_KEYS.AUTH_TOKEN, access, {
    ...cookieOptions,
    expires: 1,
  });

  if (tokens.refreshToken) {
    const refresh = stripBearer(tokens.refreshToken);
    if (refresh) {
      Cookies.set(STORAGE_KEYS.REFRESH_TOKEN, refresh, {
        ...cookieOptions,
        expires: 7,
      });
    }
  }
};

// Функция для удаления токенов
const removeAuthTokens = () => {
  Cookies.remove(STORAGE_KEYS.AUTH_TOKEN, { path: "/" });
  Cookies.remove(STORAGE_KEYS.REFRESH_TOKEN, { path: "/" });
};

// Функция для проверки и обновления токена при необходимости
const ensureValidToken = async (): Promise<string | null> => {
  const tokens = getAuthTokens();

  if (!tokens?.accessToken) {
    return null;
  }

  // Проверяем, не истек ли токен
  if (isTokenExpired(tokens.accessToken)) {
    console.log("Access token expired, attempting refresh...");
    return await refreshAccessToken();
  }

  return tokens.accessToken;
};

// Функция для обновления токена
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const tokens = getAuthTokens();
    if (!tokens?.refreshToken) {
      console.log("No refresh token available");
      return null;
    }

    // Проверяем refresh token на истечение
    if (isTokenExpired(tokens.refreshToken)) {
      console.log("Refresh token expired");
      return null;
    }

    console.log("Refreshing access token...");
    const response = await axios.post<RefreshTokenResponse>(
      `${config.api.baseUrl}${API_ROUTES.auth.refresh}`,
      { refreshToken: tokens.refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const newTokens: AuthTokens = {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    };

    setAuthTokens(newTokens);
    console.log("Token refreshed successfully");
    return newTokens.accessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    removeAuthTokens();

    // Редирект на страницу входа только если мы не на странице входа
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      window.location.href = "/login";
    }

    return null;
  }
};

// Request interceptor
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Пропускаем добавление токена для публичных эндпоинтов
    const publicEndpoints = [
      API_ROUTES.auth.login,
      API_ROUTES.auth.register,
      API_ROUTES.auth.registerCosmetologist,
      API_ROUTES.auth.forgotPassword,
      API_ROUTES.auth.resetPassword,
      API_ROUTES.auth.refresh,
    ];

    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint),
    );

    if (!isPublicEndpoint) {
      const token = await ensureValidToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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

    // Если ошибка 401 и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Если это запрос на обновление токена или вход, не пытаемся обновить
      if (
        originalRequest.url?.includes(API_ROUTES.auth.refresh) ||
        originalRequest.url?.includes(API_ROUTES.auth.login)
      ) {
        removeAuthTokens();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const newToken = await refreshAccessToken();
          isRefreshing = false;

          if (newToken) {
            onTokenRefreshed(newToken);

            // Повторяем оригинальный запрос с новым токеном
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch {
          isRefreshing = false;
          onTokenRefreshed("");
          return Promise.reject(error);
        }
      } else {
        // Если уже идет обновление токена, ждем результата
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }
    }

    // Обрабатываем другие ошибки
    handleApiError(error);
    return Promise.reject(error);
  },
);

// Экспортируем функции для работы с токенами
export const auth = {
  // Получение текущего ID пользователя из токена
  getCurrentUserId: (): string | null => {
    const tokens = getAuthTokens();
    if (!tokens?.accessToken) return null;

    const user = getUserFromToken(tokens.accessToken);
    return user?.id || null;
  },

  // Получение текущего пользователя из токена
  getCurrentUser: () => {
    const tokens = getAuthTokens();
    if (!tokens?.accessToken) return null;

    return getUserFromToken(tokens.accessToken);
  },

  // Проверка, является ли пользователь админом
  isAdmin: (): boolean => {
    const user = auth.getCurrentUser();
    return user?.role === "ADMIN";
  },

  setTokens: setAuthTokens,
  getTokens: getAuthTokens,
  removeTokens: removeAuthTokens,
  isAuthenticated: () => {
    const tokens = getAuthTokens();
    return !!(tokens?.accessToken && !isTokenExpired(tokens.accessToken));
  },
  ensureValidToken,
};

export default apiClient;
