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
      return login(data.email, data.password);
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
      firstName?: string;
      lastName?: string;
    }) => {
      const response = await apiClient.post("/auth/register", {
        ...data,
        role: "COSMETOLOGIST",
      });
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
      const response = await apiClient.post("/auth/forgot-password", { email });
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
    mutationFn: async (data: { token: string; password: string }) => {
      const response = await apiClient.post("/auth/reset-password", data);
      return response.data;
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
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
