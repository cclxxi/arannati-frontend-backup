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

// Типы для параметров запроса
type ParamValue = string | number | boolean | null | undefined;
type ParamArray = ParamValue[];
type QueryParams = Record<string, ParamValue | ParamArray>;

// Кастомная функция для сериализации параметров
const paramsSerializer = (params: QueryParams): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    // Обработка массивов - для sort передаем каждый элемент отдельно
    if (Array.isArray(value)) {
      if (key === "sort") {
        // Для sort передаем каждый элемент как отдельный параметр sort
        value.forEach((item) => {
          if (item !== null && item !== undefined) {
            searchParams.append("sort", String(item));
          }
        });
      } else {
        // Для других массивов используем формат key[]=value
        value.forEach((item) => {
          if (item !== null && item !== undefined) {
            searchParams.append(`${key}[]`, String(item));
          }
        });
      }
    } else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

// Создаем instance Axios с правильными настройками CORS
const apiClient: AxiosInstance = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  withCredentials: true, // Важно для CORS с credentials
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  paramsSerializer, // Используем кастомный сериализатор
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

const stripBearer = (value?: string): string | undefined => {
  if (!value) return undefined;
  // Токен уже без Bearer префикса? Возвращаем как есть
  if (!value.startsWith("Bearer ")) return value;
  // Убираем Bearer префикс
  return value.substring(7).trim();
};

// Функция для получения токенов
const getAuthTokens = (): AuthTokens | null => {
  const accessToken = Cookies.get(STORAGE_KEYS.AUTH_TOKEN);
  const refreshToken = Cookies.get(STORAGE_KEYS.REFRESH_TOKEN);

  // Если нет access токена, возвращаем null
  if (!accessToken || accessToken === "undefined") {
    return null;
  }

  return {
    accessToken, // Токен уже без Bearer префикса в куки
    refreshToken,
  };
};

// Функция для сохранения токенов
const setAuthTokens = (tokens: AuthTokens) => {
  const cookieOptions = {
    secure: config.isProduction,
    sameSite: "lax" as const, // Изменено на lax для CORS
    path: "/",
  };

  // Убираем Bearer префикс если есть
  const accessToken = stripBearer(tokens.accessToken);

  if (!accessToken) {
    console.error("No access token to save");
    return;
  }

  // Сохраняем access token
  Cookies.set(STORAGE_KEYS.AUTH_TOKEN, accessToken, {
    ...cookieOptions,
    expires: 1, // 1 день
  });

  // Сохраняем refresh token если есть
  if (tokens.refreshToken) {
    const refreshToken = stripBearer(tokens.refreshToken);
    if (refreshToken) {
      Cookies.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken, {
        ...cookieOptions,
        expires: 7, // 7 дней
      });
    }
  }

  console.log("Tokens saved to cookies:", {
    accessToken: accessToken.substring(0, 20) + "...",
    refreshToken: tokens.refreshToken ? "present" : "absent",
  });
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
        withCredentials: true,
      },
    );

    // Извлекаем токены из ответа (могут быть с префиксом Bearer)
    const newAccessToken =
      response.data.accessToken?.replace("Bearer ", "") ||
      response.data.accessToken;
    const newRefreshToken =
      response.data.refreshToken?.replace("Bearer ", "") ||
      response.data.refreshToken;

    const newTokens: AuthTokens = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };

    setAuthTokens(newTokens);
    console.log("Token refreshed successfully");
    return newAccessToken;
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
    // Only set JSON content type if data is not FormData
    if (config.data && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    // Пропускаем добавление токена для публичных эндпоинтов
    const publicEndpoints = [
      API_ROUTES.auth.login,
      API_ROUTES.auth.register,
      API_ROUTES.auth.registerCosmetologist,
      API_ROUTES.auth.forgotPassword,
      API_ROUTES.auth.resetPassword,
      API_ROUTES.auth.refresh,
      "/dashboard",
      "/catalog",
      "/cart/count",
      "/wishlist/check",
      "/statistics",
      "/orders/shipping", // shipping calculation is public
    ];

    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint),
    );

    // Специальная логика для /orders - GET запросы публичные
    const isPublicOrdersRequest =
      config.url?.includes("/orders") &&
      config.method?.toLowerCase() === "get" &&
      !config.url?.includes("/orders/my"); // /orders/my требует авторизацию

    if (!isPublicEndpoint && !isPublicOrdersRequest) {
      const token = await ensureValidToken();
      if (token) {
        // Добавляем Bearer префикс при отправке
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Added auth header for:", config.url);
      } else {
        console.log("No valid token for protected endpoint:", config.url);
      }
    } else {
      console.log("Public access to endpoint:", config.url);
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

    // Обработка 401 ошибки
    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        // Ждем обновления токена
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest?.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const newToken = await refreshAccessToken();
      isRefreshing = false;
      onTokenRefreshed(newToken || "");

      if (newToken && originalRequest?.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
    }

    // Обработка CORS ошибок
    if (error.code === "ERR_NETWORK" || error.message.includes("CORS")) {
      console.error("CORS Error:", {
        url: error.config?.url,
        method: error.config?.method,
        message: error.message,
      });

      // Проверяем, доступен ли бэкенд
      if (error.config?.url) {
        console.error(
          `Failed to reach backend at: ${error.config.baseURL}${error.config.url}`,
        );
      }
    }

    return Promise.reject(handleApiError(error));
  },
);

// Объект auth для работы с токенами
export const auth = {
  getTokens: getAuthTokens,
  setTokens: setAuthTokens,
  removeTokens: removeAuthTokens,
  ensureValidToken,
  isAuthenticated: (): boolean => {
    const tokens = getAuthTokens();
    return !!(tokens?.accessToken && !isTokenExpired(tokens.accessToken));
  },
  getCurrentUserId: (): string | null => {
    const tokens = getAuthTokens();
    if (!tokens?.accessToken) return null;

    const user = getUserFromToken(tokens.accessToken);
    return user?.userId || null;
  },
  getCurrentUser: () => {
    const tokens = getAuthTokens();
    if (!tokens?.accessToken) return null;

    return getUserFromToken(tokens.accessToken);
  },
};

export default apiClient;

// Экспортируем функции для работы с токенами (для обратной совместимости)
export {
  getAuthTokens,
  setAuthTokens,
  removeAuthTokens,
  ensureValidToken,
  subscribeTokenRefresh,
};
