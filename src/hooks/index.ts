// src/hooks/index.ts
// Auth hooks
import { useAuth as importedUseAuth } from "./queries/useAuth";
export { useIsAuthenticated } from "./queries/useIsAuthenticated";

// Re-export the original useAuth
export const useAuth = importedUseAuth;

// Re-export auth hooks from useAuth for backward compatibility
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import toast from "react-hot-toast";

export function useCurrentUser() {
  const { user, isLoading } = importedUseAuth();
  return { data: user, isLoading, error: null };
}

export function useLogin() {
  const { login } = importedUseAuth();
  const mutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      return login(data);
    },
  });

  return {
    mutate: (data: { email: string; password: string }) =>
      mutation.mutate(data),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useRegister() {
  const mutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      confirmPassword: string;
      firstName: string;
      lastName: string;
    }) => {
      const response = await apiClient.post("/auth/register", data);
      return response.data;
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Ошибка при регистрации";
      toast.error(message);
    },
    onSuccess: () => {
      toast.success("Регистрация прошла успешно!");
    },
  });

  return {
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useRegisterCosmetologist() {
  const mutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      confirmPassword: string;
      firstName: string;
      lastName: string;
      phone: string;
      institutionName?: string;
      graduationYear: number;
      specialization?: string;
      licenseNumber?: string;
      diplomaFile: File;
    }) => {
      // Создаем FormData для multipart/form-data запроса
      const formData = new FormData();

      // Create the user data object
      const userData = {
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        institutionName: data.institutionName || "",
        graduationYear: data.graduationYear,
        specialization: data.specialization || "",
        licenseNumber: data.licenseNumber || "",
      };

      // Add as JSON string
      formData.append("userData", JSON.stringify(userData));

      // Add the file
      formData.append("diplomaFile", data.diplomaFile);

      // Логируем для отладки
      console.log("[DEBUG] Sending cosmetologist registration");
      console.log("[DEBUG] userData:", JSON.stringify(userData, null, 2));
      console.log("[DEBUG] diplomaFile:", data.diplomaFile.name);

      // Отправляем запрос
      const response = await apiClient.post(
        "/auth/register/cosmetologist",
        formData,
      );

      return response.data;
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      console.error("[DEBUG] Registration error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Ошибка при регистрации косметолога";
      toast.error(message);
    },
    onSuccess: () => {
      toast.success(
        "Заявка на регистрацию отправлена! Мы проверим ваши данные и свяжемся с вами.",
      );
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}

export function useLogout() {
  const { logout } = importedUseAuth();
  const mutation = useMutation({
    mutationFn: async () => {
      return logout();
    },
  });

  return {
    logout: () => mutation.mutate(),
    isLoading: mutation.isPending,
  };
}

export function useForgotPassword() {
  const mutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiClient.post(
        `/auth/forgot-password?email=${encodeURIComponent(email)}`,
      );
      return response.data;
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      const message =
        error.response?.data?.message || "Ошибка при отправке письма";
      toast.error(message);
    },
    onSuccess: () => {
      toast.success("Письмо для восстановления пароля отправлено!");
    },
  });

  return {
    mutate: (data: { email: string }) => mutation.mutate(data.email),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useResetPassword() {
  const mutation = useMutation({
    mutationFn: async (data: {
      token: string;
      password: string;
      confirmPassword: string;
    }) => {
      const { token, password, confirmPassword } = data;
      const response = await apiClient.post(
        `/auth/reset-password?token=${encodeURIComponent(token)}&password=${encodeURIComponent(password)}&confirmPassword=${encodeURIComponent(confirmPassword)}`,
      );
      return response.data;
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      const message =
        error.response?.data?.message || "Ошибка при сбросе пароля";
      toast.error(message);
    },
    onSuccess: () => {
      toast.success("Пароль успешно изменен!");
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
  };
}

export function useHasRole(requiredRoles?: string | string[]) {
  const { user } = importedUseAuth();

  if (!requiredRoles) return true;
  if (!user) return false;

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.some((role) => user.role === role);
}

// Cart hooks
export {
  useCartItems,
  useCartCount,
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
} from "./queries/useCart";

// Wishlist hooks
export {
  useWishlistItems,
  useWishlistCount,
  useToggleWishlist,
  useRemoveFromWishlist,
} from "./queries/useWishlist";

// Product hooks - commented out until files are created
// export { useProducts } from "./queries/useProducts";
// export { useProduct } from "./queries/useProduct";
// export { useFeaturedProducts } from "./queries/useFeaturedProducts";
// export { useProductReviews } from "./queries/useProductReviews";
// export { useSubmitReview } from "./queries/useSubmitReview";

// Dashboard hooks - commented out until files are created
// export { useDashboard } from "./queries/useDashboard";
export { useOrders } from "./queries/useOrders";
// export { useMessages } from "./queries/useMessages";
// export { useOrderDetails } from "./queries/useOrderDetails";

// Admin hooks - commented out until files are created
// export { useAdminDashboard } from "./queries/useAdminDashboard";
// export { useAdminUsers } from "./queries/useAdminUsers";
// export { useToggleUserActive } from "./queries/useToggleUserActive";

// Cosmetologist hooks - commented out until files are created
// export { useCosmetologistDashboard } from "./queries/useCosmetologistDashboard";
// export { useCosmetologistReviews } from "./queries/useCosmetologistReviews";
// export { useCosmetologistCatalogs } from "./queries/useCosmetologistCatalogs";

// Common hooks
export { useDebounce } from "./useDebounce";
export { useTheme } from "./useTheme";
// export { useLocalStorage } from "./useLocalStorage";
// export { useMediaQuery } from "./useMediaQuery";
// export { useDocumentTitle } from "./useDocumentTitle";
// export { useScrollToTop } from "./useScrollToTop";
// export { useIntersectionObserver } from "./useIntersectionObserver";
