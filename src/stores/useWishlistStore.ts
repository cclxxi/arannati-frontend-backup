import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { wishlistApi } from "@/lib/api/services/wishlist";
import type { WishlistItemDTO } from "@/types/api";

export interface WishlistStore {
  items: WishlistItemDTO[];
  isLoading: boolean;

  // Actions
  fetchWishlist: () => Promise<void>;
  toggleItem: (productId: number) => Promise<boolean>;
  removeItem: (productId: number) => Promise<void>;
  clearWishlist: () => void;
  isInWishlist: (productId: number) => boolean;
  getCount: () => number;
}

// Функция для валидации и нормализации items
const normalizeWishlistItems = (items: unknown): WishlistItemDTO[] => {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  if (typeof items === "object" && items !== null) {
    const obj = items as Record<string, unknown>;
    if (obj["items"] && Array.isArray(obj["items"])) return obj["items"];
    if (obj["data"] && Array.isArray(obj["data"])) return obj["data"];
  }
  return [];
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      fetchWishlist: async () => {
        set({ isLoading: true });
        try {
          const items = await wishlistApi.getItems();
          set({ items: normalizeWishlistItems(items), isLoading: false });
        } catch (error) {
          console.error("Failed to fetch wishlist:", error);
          set({ items: [], isLoading: false });
        }
      },

      toggleItem: async (productId) => {
        try {
          const result = await wishlistApi.toggleItem(productId);
          await get().fetchWishlist(); // Перезагружаем для синхронизации
          return result.inWishlist;
        } catch (error) {
          console.error("Failed to toggle wishlist item:", error);
          throw error;
        }
      },

      removeItem: async (productId) => {
        try {
          await wishlistApi.removeItem(productId);
          set((state) => ({
            items: normalizeWishlistItems(state.items).filter(
              (item) => (item.productId || item.product?.id) !== productId,
            ),
          }));
        } catch (error) {
          console.error("Failed to remove wishlist item:", error);
          throw error;
        }
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      isInWishlist: (productId) => {
        const items = normalizeWishlistItems(get().items);
        return items.some(
          (item) => (item.productId || item.product?.id) === productId,
        );
      },

      getCount: () => {
        const items = normalizeWishlistItems(get().items);
        return items.length;
      },
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: normalizeWishlistItems(state.items) }),
      // Добавляем валидацию при восстановлении из localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.items = normalizeWishlistItems(state.items);
        }
      },
    },
  ),
);
