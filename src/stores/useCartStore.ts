// src/stores/useCartStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { cartApi } from "@/lib/api/services/cart";
import { catalogApi } from "@/lib/api/services/catalog";
import type { CartDTO, ProductDTO } from "@/types/api";

// Расширяем CartDTO для включения полной информации о продукте
export interface CartItemWithProduct extends CartDTO {
  product?: ProductDTO;
}

export interface CartStore {
  items: CartItemWithProduct[];
  isLoading: boolean;

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => void;
  getTotalCount: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: number) => boolean;
  getItemQuantity: (productId: number) => number;
  getCartItem: (productId: number) => CartItemWithProduct | undefined;
}

// Функция для валидации и нормализации items
const normalizeItems = (items: unknown): CartItemWithProduct[] => {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  if (typeof items === "object" && items !== null) {
    const obj = items as Record<string, unknown>;
    if (obj["items"] && Array.isArray(obj["items"])) return obj["items"];
    if (obj["data"] && Array.isArray(obj["data"])) return obj["data"];
  }
  return [];
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const response = await cartApi.getItems();
          const cartItems = normalizeItems(response);

          // Загружаем информацию о продуктах для каждого элемента корзины
          const itemsWithProducts = await Promise.all(
            cartItems.map(async (item) => {
              try {
                // Загружаем информацию о продукте по productId
                const product = await catalogApi.getProductDetails(
                  item.productId,
                );
                return {
                  ...item,
                  product,
                } as CartItemWithProduct;
              } catch (error) {
                console.error(
                  `Failed to load product ${item.productId}:`,
                  error,
                );
                // Если не удалось загрузить продукт, возвращаем элемент без product
                return item as CartItemWithProduct;
              }
            }),
          );

          set({ items: itemsWithProducts, isLoading: false });
        } catch (error) {
          console.error("Failed to fetch cart:", error);
          set({ items: [], isLoading: false });
        }
      },

      addItem: async (productId, quantity = 1) => {
        try {
          const state = get();
          const items = normalizeItems(state.items);
          const existingItem = items.find(
            (item) => item.productId === productId,
          );

          if (existingItem?.id) {
            await state.updateQuantity(
              existingItem.id,
              existingItem.quantity + quantity,
            );
          } else {
            await cartApi.addItem({ productId, quantity });
            await state.fetchCart(); // Перезагружаем для синхронизации с продуктами
          }
        } catch (error: unknown) {
          if (error && typeof error === "object" && "response" in error) {
            const httpError = error as { response?: { status?: number } };
            if (httpError.response?.status === 409) {
              await get().fetchCart();
            } else {
              console.error("Failed to add item to cart:", error);
              throw error;
            }
          } else {
            console.error("Failed to add item to cart:", error);
            throw error;
          }
        }
      },

      updateQuantity: async (itemId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(itemId);
          return;
        }

        try {
          await cartApi.updateItem(itemId, quantity);
          // Обновляем количество локально для быстрого отклика
          set((state) => ({
            items: normalizeItems(state.items).map((item) =>
              item.id === itemId ? { ...item, quantity } : item,
            ),
          }));
        } catch (error) {
          console.error("Failed to update cart item:", error);
          // При ошибке перезагружаем корзину
          await get().fetchCart();
          throw error;
        }
      },

      removeItem: async (itemId) => {
        try {
          await cartApi.removeItem(itemId);
          set((state) => ({
            items: normalizeItems(state.items).filter(
              (item) => item.id !== itemId,
            ),
          }));
        } catch (error) {
          console.error("Failed to remove cart item:", error);
          throw error;
        }
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalCount: () => {
        const items = normalizeItems(get().items);
        return items.reduce((total, item) => total + (item.quantity || 0), 0);
      },

      getTotalPrice: () => {
        const items = normalizeItems(get().items);
        return items.reduce((total, item) => {
          const price =
            item.product?.salePrice ||
            item.product?.effectivePrice ||
            item.product?.regularPrice ||
            item.product?.price ||
            0;
          return total + price * (item.quantity || 0);
        }, 0);
      },

      isInCart: (productId) => {
        const items = normalizeItems(get().items);
        return items.some((item) => item.productId === productId);
      },

      getItemQuantity: (productId) => {
        const items = normalizeItems(get().items);
        const item = items.find((item) => item.productId === productId);
        return item?.quantity || 0;
      },

      getCartItem: (productId) => {
        const items = normalizeItems(get().items);
        return items.find((item) => item.productId === productId);
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: normalizeItems(state.items) }),
      // Добавляем валидацию при восстановлении из localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.items = normalizeItems(state.items);
          // При восстановлении из localStorage перезагружаем данные с сервера
          // чтобы получить актуальную информацию о продуктах
          setTimeout(() => {
            state.fetchCart();
          }, 100);
        }
      },
    },
  ),
);
