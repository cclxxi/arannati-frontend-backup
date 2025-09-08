// Экспорт всех API сервисов
export { default as apiClient, auth, api } from "./client";
export { authApi } from "./services/auth";
export { catalogApi } from "./services/catalog";
export { cartApi } from "./services/cart";
export { wishlistApi } from "./services/wishlist";
export { ordersApi } from "./services/orders";
export { messagesApi } from "./services/messages";

// Экспорт типов
export type { CatalogFilters } from "./services/catalog";
export type { CartItemInput, CartSummary } from "./services/cart";
export type {
  OrderFilters,
  ShippingCalculation,
  CheckoutSummary,
} from "./services/orders";
export type {
  SendMessageInput,
  SendSupportInput,
  ReplySupportInput,
} from "./services/messages";
