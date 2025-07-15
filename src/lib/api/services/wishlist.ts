import apiClient from "@/lib/api/client";
import { API_ROUTES } from "@/lib/constants";
import type { WishlistItemDTO } from "@/types/api";

// API методы для избранного
export const wishlistApi = {
  // Получение списка избранных товаров
  getItems: async (): Promise<WishlistItemDTO[]> => {
    const response = await apiClient.get<WishlistItemDTO[]>(
      API_ROUTES.wishlist.list,
    );
    return response.data;
  },

  // Добавление товара в избранное
  addItem: async (productId: number): Promise<WishlistItemDTO> => {
    const response = await apiClient.post<WishlistItemDTO>(
      API_ROUTES.wishlist.add(productId),
    );
    return response.data;
  },

  // Удаление товара из избранного
  removeItem: async (productId: number): Promise<void> => {
    await apiClient.delete(API_ROUTES.wishlist.remove(productId));
  },

  // Переключение статуса товара в избранном
  toggleItem: async (productId: number): Promise<{ inWishlist: boolean }> => {
    const response = await apiClient.put<{ inWishlist: boolean }>(
      API_ROUTES.wishlist.toggle(productId),
    );
    return response.data;
  },

  // Проверка наличия товара в избранном
  checkItem: async (productId: number): Promise<boolean> => {
    const response = await apiClient.get<{ inWishlist: boolean }>(
      API_ROUTES.wishlist.check(productId),
    );
    return response.data.inWishlist;
  },

  // Массовое добавление в корзину
  addAllToCart: async (productIds: number[]): Promise<void> => {
    // Этот метод нужно будет добавить на бэкенде
    // Пока реализуем через последовательные запросы
    const { cartApi } = await import("./cart");

    for (const productId of productIds) {
      await cartApi.addItem({ productId, quantity: 1 });
    }
  },

  // Получение количества товаров в избранном
  getCount: async (): Promise<number> => {
    const items = await wishlistApi.getItems();
    return items.length;
  },
};
