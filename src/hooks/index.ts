// Auth hooks
import { useAuth as importedUseAuth } from "./queries/useAuth";
export { useIsAuthenticated } from "./queries/useIsAuthenticated";

// Re-export the original useAuth
export const useAuth = importedUseAuth;

// Re-export auth hooks from useAuth for backward compatibility
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

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
      firstName?: string;
      lastName?: string;
    }) => {
      const response = await apiClient.post("/auth/register", data);
      return response.data;
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
      firstName: string;
      lastName: string;
      phone: string;
      institutionName?: string;
      graduationYear: number;
      specialization?: string;
      licenseNumber?: string;
      diplomaFile: File;
    }) => {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("phone", data.phone);
      if (data.institutionName) {
        formData.append("institutionName", data.institutionName);
      }
      formData.append("graduationYear", data.graduationYear.toString());
      if (data.specialization) {
        formData.append("specialization", data.specialization);
      }
      if (data.licenseNumber) {
        formData.append("licenseNumber", data.licenseNumber);
      }
      formData.append("diplomaFile", data.diplomaFile);
      formData.append("role", "COSMETOLOGIST");

      const response = await apiClient.post(
        "/auth/register/cosmetologist",
        formData,
      );
      return response.data;
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
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

  const hasRole = (role: string) => user?.role === role;

  // If requiredRoles is provided, check if user has any of the required roles
  const hasRequiredRole = () => {
    if (!user) return false;
    if (!requiredRoles) return true;

    if (typeof requiredRoles === "string") {
      return hasRole(requiredRoles);
    }

    return requiredRoles.some((role) => hasRole(role));
  };

  return {
    hasRole,
    hasRequiredRole: hasRequiredRole(),
  };
}

// Catalog hooks
export {
  useProducts,
  useInfiniteProducts,
  useProduct,
  useProductSearch,
  usePopularProducts,
  useSaleProducts,
  useNewProducts,
  useSimilarProducts,
  usePrefetchProduct,
} from "./queries/useCatalog";

// Cart hooks
export {
  useCartItems,
  useCartCount,
  useCartSummary,
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
  useValidateCart,
} from "./queries/useCart";

// Wishlist hooks
export {
  useWishlistItems,
  useWishlistCount,
  useIsInWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
  useToggleWishlist,
  useAddAllToCart,
} from "./queries/useWishlist";

// Orders hooks
export {
  useOrders,
  useOrderDetails,
  useCheckoutSummary,
  useShippingCalculation,
  useCreateOrder,
  useCancelOrder,
  useRepeatOrder,
  useRecentOrders,
  useOrderStats,
  usePrefetchOrder,
} from "./queries/useOrders";

// Messages hooks
export {
  useChats,
  useChatMessages,
  useSendMessage,
  useSendSupportRequest,
  useMarkChatAsRead,
  useUnreadMessagesCount,
  useTypingIndicator,
} from "./queries/useMessages";

// Theme hook
export { useTheme } from "./useTheme";
