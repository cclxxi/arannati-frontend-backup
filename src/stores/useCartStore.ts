import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { cartApi } from "@/lib/api/services/cart";
import type { CartDTO } from "@/types/api";

export interface CartStore {
  items: CartDTO[];
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
  getCartItem: (productId: number) => CartDTO | undefined;
}

// Функция для валидации и нормализации items
const normalizeItems = (items: unknown): CartDTO[] => {
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
          const items = normalizeItems(response);
          set({ items, isLoading: false });
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
            await state.fetchCart(); // Перезагружаем для синхронизации
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
          await get().fetchCart();
        } catch (error) {
          console.error("Failed to update cart item:", error);
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
          const price = item.product?.price || item.product?.regularPrice || 0;
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
        }
      },
    },
  ),
);
