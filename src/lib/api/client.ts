// src/lib/api/client.ts
import Cookies from "js-cookie";
import toast from "react-hot-toast";

// Типы для API
export interface ApiResponse<T = unknown> {
  data: T;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  requiresAuth?: boolean;
  showError?: boolean;
}

export type ApiRequestData = Record<string, unknown> | FormData | null;

// Auth utilities
export const auth = {
  getTokens: () => {
    const accessToken = Cookies.get("accessToken");
    const refreshToken = Cookies.get("refresh-token");
    return accessToken ? { accessToken, refreshToken } : null;
  },

  setTokens: (accessToken: string, refreshToken?: string) => {
    Cookies.set("accessToken", accessToken, {
      expires: 7,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    if (refreshToken) {
      Cookies.set("refresh-token", refreshToken, {
        expires: 30,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }
  },

  clearTokens: () => {
    Cookies.remove("accessToken");
    Cookies.remove("refresh-token");
  },

  removeTokens: () => {
    Cookies.remove("accessToken");
    Cookies.remove("refresh-token");
  },

  isAuthenticated: () => {
    return !!Cookies.get("accessToken");
  },
};

// API Client Class
class ApiClientClass {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    this.defaultHeaders = {};
  }

  public async request<T = unknown>(
    endpoint: string,
    options: ApiRequestOptions & {
      method?: string;
      body?: BodyInit | null;
    } = {},
  ): Promise<ApiResponse<T>> {
    const {
      method = "GET",
      headers = {},
      params,
      body,
      requiresAuth = false,
      showError = true,
    } = options;

    // Construct URL with params
    let url = `${this.baseURL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      ...this.defaultHeaders,
      ...headers,
    };

    // Для FormData НЕ устанавливаем Content-Type и Accept
    if (body instanceof FormData) {
      delete requestHeaders["Content-Type"];
      delete requestHeaders["Accept"];
    } else {
      // Для обычных запросов добавляем Accept
      requestHeaders["Accept"] = "application/json";

      // Для JSON body добавляем Content-Type
      if (body && !(body instanceof Blob)) {
        requestHeaders["Content-Type"] = "application/json";
      }
    }

    // Add auth token if required or if it exists
    const tokens = auth.getTokens();
    if ((requiresAuth || tokens?.accessToken) && tokens?.accessToken) {
      requestHeaders["Authorization"] = `Bearer ${tokens.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body,
        credentials: "include", // Important for CORS with cookies
      });

      // Handle non-2xx responses
      if (!response.ok) {
        let errorMessage = `Request failed: ${response.status}`;
        let errorData: {
          message?: string;
          error?: string;
          [key: string]: unknown;
        } | null = null;

        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json();
            errorMessage =
              errorData?.message || errorData?.error || errorMessage;
          }
        } catch (e) {
          console.error("Failed to parse error response:", e);
        }

        // Handle specific error codes
        if (response.status === 401) {
          // Only clear tokens and redirect if this was an authenticated request
          if (requiresAuth) {
            auth.clearTokens();
            // Redirect to login
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }
          throw new Error("Unauthorized");
        }

        if (response.status === 403) {
          throw new Error("Forbidden");
        }

        // Show error toast if enabled
        if (showError && response.status !== 401 && response.status !== 403) {
          toast.error(errorMessage);
        }

        const error = new Error(errorMessage) as Error & {
          response: {
            data: {
              message?: string;
              error?: string;
              [key: string]: unknown;
            } | null;
            status: number;
          };
        };
        error.response = { data: errorData, status: response.status };
        throw error;
      }

      // Handle empty responses
      if (response.status === 204) {
        return { data: {} as T };
      }

      // Parse JSON response
      const responseData = await response.json();
      return { data: responseData };
    } catch (error) {
      // Network errors or other issues
      if (error instanceof Error) {
        // Don't show error toast for auth errors on non-auth requests
        if (
          !requiresAuth &&
          (error.message === "Unauthorized" || error.message === "Forbidden")
        ) {
          return { data: {} as T };
        }

        if (
          showError &&
          error.message !== "Unauthorized" &&
          error.message !== "Forbidden"
        ) {
          if (
            error.message === "Failed to fetch" ||
            error.message.includes("ERR_CONNECTION_REFUSED")
          ) {
            toast.error(
              "Не удалось подключиться к серверу. Проверьте, запущен ли backend на порту 8080.",
            );
          }
        }

        console.error(`API request failed: ${endpoint}`, error);
        throw error;
      }

      throw new Error("Unknown error occurred");
    }
  }

  // HTTP Methods
  get<T = unknown>(
    endpoint: string,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T = unknown>(
    endpoint: string,
    data?: ApiRequestData,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<T>> {
    // For FormData, don't set Content-Type - let browser set it with boundary
    if (data instanceof FormData) {
      return this.request<T>(endpoint, {
        ...options,
        method: "POST",
        body: data,
      });
    }

    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : null,
    });
  }

  put<T = unknown>(
    endpoint: string,
    data?: ApiRequestData,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<T>> {
    if (data instanceof FormData) {
      return this.request<T>(endpoint, {
        ...options,
        method: "PUT",
        body: data,
      });
    }

    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : null,
    });
  }

  delete<T = unknown>(
    endpoint: string,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// Create and export singleton instance
const ApiClient = new ApiClientClass();

const apiClient = {
  get: ApiClient.get.bind(ApiClient),
  post: ApiClient.post.bind(ApiClient),
  put: ApiClient.put.bind(ApiClient),
  delete: ApiClient.delete.bind(ApiClient),
  request: ApiClient.request.bind(ApiClient),
};

export default apiClient;

// Convenience API methods
export const api = {
  // Auth
  login: (email: string, password: string) => {
    return apiClient.post("/auth/login", { email, password });
  },

  register: (data: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
  }) => {
    return apiClient.post("/auth/register", data);
  },

  registerCosmetologist: (formData: FormData) => {
    return apiClient.post("/auth/register/cosmetologist", formData);
  },

  logout: () => apiClient.post("/auth/logout"),

  getCurrentUser: () => apiClient.get("/auth/me", { requiresAuth: true }),

  forgotPassword: (email: string) => {
    return apiClient.post(
      `/auth/forgot-password?email=${encodeURIComponent(email)}`,
    );
  },

  resetPassword: (token: string, password: string, confirmPassword: string) => {
    return apiClient.post(
      `/auth/reset-password?token=${encodeURIComponent(token)}&password=${encodeURIComponent(password)}&confirmPassword=${encodeURIComponent(confirmPassword)}`,
    );
  },

  // Cart
  getCart: () => apiClient.get("/cart", { requiresAuth: true }),

  getCartCount: async () => {
    if (!auth.isAuthenticated()) {
      return { data: { count: 0 } };
    }
    try {
      return await apiClient.get<{ count: number }>("/cart/count", {
        requiresAuth: true,
        showError: false,
      });
    } catch {
      return { data: { count: 0 } };
    }
  },

  addToCart: (productId: number, quantity = 1) => {
    return apiClient.post(
      "/cart",
      { productId, quantity },
      { requiresAuth: true },
    );
  },

  updateCartItem: (id: number, quantity: number) => {
    return apiClient.put(`/cart/${id}`, { quantity }, { requiresAuth: true });
  },

  removeFromCart: (id: number) => {
    return apiClient.delete(`/cart/${id}`, { requiresAuth: true });
  },

  clearCart: () => {
    return apiClient.delete("/cart", { requiresAuth: true });
  },

  // Wishlist
  getWishlist: () => apiClient.get("/wishlist", { requiresAuth: true }),

  getWishlistCount: async () => {
    if (!auth.isAuthenticated()) {
      return { data: { count: 0 } };
    }
    try {
      return await apiClient.get<{ count: number }>("/wishlist/count", {
        requiresAuth: true,
        showError: false,
      });
    } catch {
      return { data: { count: 0 } };
    }
  },

  toggleWishlist: (productId: number) => {
    return apiClient.put(`/wishlist/toggle/${productId}`, null, {
      requiresAuth: true,
    });
  },

  // Products
  getProducts: (params?: Record<string, string>) => {
    const searchParams = new URLSearchParams(params).toString();
    return apiClient.get(
      `/catalog/products${searchParams ? `?${searchParams}` : ""}`,
    );
  },

  getProduct: (id: number) => apiClient.get(`/catalog/products/${id}`),

  searchProducts: (query: string, limit = 5) => {
    return apiClient.get(
      `/catalog/products?search=${encodeURIComponent(query)}&size=${limit}`,
    );
  },

  // Categories & Brands
  getCategories: () => {
    return apiClient.get("/catalog/categories").catch(() => ({
      data: [],
    }));
  },

  getBrands: () => {
    return apiClient.get("/catalog/brands").catch(() => ({
      data: [],
    }));
  },
};
