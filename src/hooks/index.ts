// Auth hooks
export {
  useCurrentUser,
  useLogin,
  useRegister,
  useRegisterCosmetologist,
  useLogout,
  useForgotPassword,
  useResetPassword,
  useIsAuthenticated,
  useHasRole,
} from "./queries/useAuth";

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
