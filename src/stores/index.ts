// Экспорт всех stores
export { useThemeStore } from "./theme";
export { useAuthStore } from "./authStore";
export { useUIStore } from "./ui";
export { useRecentlyViewedStore } from "./recentlyViewed";
export { useFiltersStore } from "./filters";

// Новые stores для корзины и вишлиста с правильной обработкой API
export { useCartStore } from "./useCartStore";
export { useWishlistStore } from "./useWishlistStore";

// Типы для stores
export type { Theme } from "./theme";
export type { AuthState } from "./authStore";
export type { UIState } from "./ui";
export type { FiltersState } from "./filters";
