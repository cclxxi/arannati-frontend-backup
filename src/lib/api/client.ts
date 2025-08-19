// src/lib/api/client.ts
import { getCookie, setCookie, deleteCookie } from "@/lib/utils/cookies";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
  params?: Record<string, unknown> | object;
}

// Define generic response type
export interface ApiResponse<T> {
  data: T;
}

// Define common request data types
export type ApiRequestData = Record<string, unknown> | FormData | object | null;

// Token refresh callback type
type TokenRefreshCallback = (token: string) => void;
const tokenRefreshCallbacks: TokenRefreshCallback[] = [];

// Function to subscribe to token refresh events
export function subscribeTokenRefresh(
  callback: TokenRefreshCallback,
): () => void {
  tokenRefreshCallbacks.push(callback);
  return () => {
    const index = tokenRefreshCallbacks.indexOf(callback);
    if (index !== -1) {
      tokenRefreshCallbacks.splice(index, 1);
    }
  };
}

// Auth helper object
export const auth = {
  setTokens: ({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken?: string;
  }) => {
    setCookie("auth-token", accessToken);
    if (refreshToken) {
      setCookie("refresh-token", refreshToken);
    }
  },
  getTokens: () => {
    const accessToken = getCookie("auth-token");
    const refreshToken = getCookie("refresh-token");

    if (!accessToken) return null;

    return {
      accessToken,
      refreshToken,
    };
  },
  removeTokens: () => {
    deleteCookie("auth-token");
    deleteCookie("refresh-token");
  },
  isAuthenticated: () => {
    return !!getCookie("auth-token");
  },
  // Added for websocket-native.ts compatibility
  ensureValidToken: async (): Promise<string> => {
    const tokens = auth.getTokens();
    if (!tokens?.accessToken) throw new Error("No access token");
    return tokens.accessToken;
  },
  getCurrentUserId: (): string => {
    // This is a stub - in a real implementation, this would decode the JWT token
    // and extract the user ID
    return "current-user-id";
  },
};

export class ApiClient {
  private static getAuthHeaders(): HeadersInit {
    const token = getCookie("auth-token");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  static async request<T = unknown>(
    endpoint: string,
    options: ApiRequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const { requiresAuth = false, headers = {}, ...restOptions } = options;

    const requestOptions: RequestInit = {
      ...restOptions,
      headers: {
        ...this.getAuthHeaders(),
        ...headers,
      },
      credentials: "include",
    };

    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, requestOptions);

      // Обрабатываем разные статусы ответа
      if (response.status === 401 && requiresAuth) {
        // Токен истек или не валиден
        throw new Error("Unauthorized");
      }

      if (response.status === 403) {
        // Доступ запрещен
        throw new Error("Forbidden");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `HTTP error! status: ${response.status}`,
        );
      }

      // Если ответ пустой (204 No Content)
      if (response.status === 204) {
        return { data: {} as T };
      }

      const responseData = await response.json();
      return { data: responseData };
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Методы для разных типов запросов
  static get<T = unknown>(
    endpoint: string,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  static post<T = unknown>(
    endpoint: string,
    data?: ApiRequestData,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body:
        data && !(data instanceof FormData)
          ? JSON.stringify(data)
          : (data as BodyInit | null),
    });
  }

  static put<T = unknown>(
    endpoint: string,
    data?: ApiRequestData,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body:
        data && !(data instanceof FormData)
          ? JSON.stringify(data)
          : (data as BodyInit | null),
    });
  }

  static delete<T = unknown>(
    endpoint: string,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// Экспортируем удобные функции для использования
// Create a default export for apiClient
const apiClient = {
  get: ApiClient.get.bind(ApiClient),
  post: ApiClient.post.bind(ApiClient),
  put: ApiClient.put.bind(ApiClient),
  delete: ApiClient.delete.bind(ApiClient),
  request: ApiClient.request.bind(ApiClient),
};

export default apiClient;

export const api = {
  // Catalog
  getProducts: (params?: Record<string, string>) => {
    const searchParams = new URLSearchParams(params).toString();
    return ApiClient.get(
      `/catalog/products${searchParams ? `?${searchParams}` : ""}`,
    );
  },

  getProduct: (id: number) => ApiClient.get(`/catalog/products/${id}`),

  searchProducts: (query: string, limit = 5) => {
    return ApiClient.get(
      `/catalog/products?search=${encodeURIComponent(query)}&size=${limit}`,
    );
  },

  // Cart
  getCartCount: () =>
    ApiClient.get<{ count: number }>("/cart/count").catch(() => ({
      data: { count: 0 },
    })),

  getCart: () => ApiClient.get("/cart", { requiresAuth: true }),

  addToCart: (productId: number, quantity = 1) => {
    return ApiClient.post(
      "/cart",
      { productId, quantity },
      { requiresAuth: true },
    );
  },

  // Wishlist
  getWishlistCount: () =>
    ApiClient.get<{ count: number }>("/wishlist/count").catch(() => ({
      data: { count: 0 },
    })),

  getWishlist: () => ApiClient.get("/wishlist", { requiresAuth: true }),

  toggleWishlist: (productId: number) => {
    return ApiClient.post(`/wishlist/toggle/${productId}`, null, {
      requiresAuth: true,
    });
  },

  // Auth
  login: (email: string, password: string) => {
    return ApiClient.post("/auth/login", { email, password });
  },

  register: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    return ApiClient.post("/auth/register", data);
  },

  logout: () => ApiClient.post("/auth/logout"),

  getCurrentUser: () => ApiClient.get("/auth/me", { requiresAuth: true }),
};
