import apiClient from "@/lib/api/client";
import { API_ROUTES } from "@/lib/constants";
import type { WishlistItemDTO, ProductDTO } from "@/types/api";

interface WishlistResponse {
  data?:
    | WishlistItemDTO[]
    | {
        data: WishlistItemResponse[];
      };
}

interface WishlistItemResponse {
  id?: number;
  userId?: number;
  productId?: number;
  product?: ProductDTO;
  createdAt?: string;
  wishlistItem?: {
    id: number;
    userId: number;
    productId: number;
    product?: ProductDTO;
    createdAt: string;
  };
}

interface WishlistAddResponse {
  wishlistItem?: {
    id: number;
    userId: number;
    productId: number;
    createdAt: string;
  };
  product?: ProductDTO;
}

interface WishlistCheckResponse {
  inWishlist?: boolean;
  id?: number;
  wishlistItem?: unknown;
}

export const wishlistApi = {
  // Получение списка избранных товаров
  getItems: async (): Promise<WishlistItemDTO[]> => {
    const response = await apiClient.get<WishlistResponse>(
      API_ROUTES.wishlist.list,
    );

    // Обработка разных форматов ответа
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      // Если данные обернуты в объект с полем data
      return (response.data.data as WishlistItemResponse[]).map((item) => ({
        id: item.wishlistItem?.id || item.id || 0,
        userId: item.wishlistItem?.userId || item.userId || 0,
        productId:
          item.wishlistItem?.productId ||
          item.product?.id ||
          item.productId ||
          0,
        product: item.product || item.wishlistItem?.product,
        createdAt:
          item.wishlistItem?.createdAt ||
          item.createdAt ||
          new Date().toISOString(),
      }));
    }
    return [];
  },

  // Добавление товара в избранное
  addItem: async (productId: number): Promise<WishlistItemDTO> => {
    const response = await apiClient.post<WishlistAddResponse>(
      API_ROUTES.wishlist.add(productId),
    );

    // Обработка ответа
    if (response.data?.wishlistItem) {
      return {
        id: response.data.wishlistItem.id,
        userId: response.data.wishlistItem.userId,
        productId: response.data.wishlistItem.productId || productId,
        product: response.data.product,
        createdAt: response.data.wishlistItem.createdAt,
      };
    }

    return response.data as WishlistItemDTO;
  },

  // Удаление товара из избранного
  removeItem: async (productId: number): Promise<void> => {
    await apiClient.delete(API_ROUTES.wishlist.remove(productId));
  },

  // Переключение статуса товара в избранном
  toggleItem: async (productId: number): Promise<{ inWishlist: boolean }> => {
    try {
      const response = await apiClient.put<unknown>(
        API_ROUTES.wishlist.toggle(productId),
      );

      // Обрабатываем разные форматы ответа от бэкенда

      // Если бэкенд вернул полный список после toggle
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data &&
        Array.isArray(response.data.data)
      ) {
        const isInWishlist = response.data.data.some((item: unknown) => {
          if (!item || typeof item !== "object") return false;
          const typedItem = item as {
            wishlistItem?: { productId?: number };
            productId?: number;
            product?: { id?: number };
          };
          return (
            typedItem.wishlistItem?.productId === productId ||
            typedItem.productId === productId ||
            typedItem.product?.id === productId
          );
        });
        return { inWishlist: isInWishlist };
      }

      // Если бэкенд вернул boolean
      if (typeof response.data === "boolean") {
        return { inWishlist: response.data };
      }

      // Если бэкенд вернул объект с полем inWishlist
      if (
        response.data &&
        typeof response.data === "object" &&
        "inWishlist" in response.data &&
        typeof response.data.inWishlist === "boolean"
      ) {
        return { inWishlist: response.data.inWishlist };
      }

      // Если бэкенд вернул объект с полем added/removed
      if (
        response.data &&
        typeof response.data === "object" &&
        "added" in response.data &&
        typeof response.data.added === "boolean"
      ) {
        return { inWishlist: response.data.added };
      }
      if (
        response.data &&
        typeof response.data === "object" &&
        "removed" in response.data &&
        typeof response.data.removed === "boolean"
      ) {
        return { inWishlist: !response.data.removed };
      }

      // Если бэкенд вернул объект с полями success и message
      if (
        response.data &&
        typeof response.data === "object" &&
        "success" in response.data &&
        "message" in response.data &&
        typeof response.data.message === "string"
      ) {
        const message = response.data.message.toLowerCase();
        if (message.includes("added") || message.includes("добавлен")) {
          return { inWishlist: true };
        }
        if (message.includes("removed") || message.includes("удален")) {
          return { inWishlist: false };
        }
      }

      // Если формат ответа неизвестен, проверяем текущее состояние через отдельный запрос
      console.warn(
        "Unknown response format from toggleItem API:",
        response.data,
      );

      try {
        const checkResponse = await apiClient.get<WishlistCheckResponse>(
          API_ROUTES.wishlist.check(productId),
        );

        if (typeof checkResponse.data?.inWishlist === "boolean") {
          return { inWishlist: checkResponse.data.inWishlist };
        }

        // Если вернулся объект товара, значит он в вишлисте
        if (checkResponse.data && typeof checkResponse.data === "object") {
          return { inWishlist: true };
        }

        return { inWishlist: false };
      } catch (checkError) {
        console.error(
          "Failed to check wishlist state after toggle:",
          checkError,
        );
        // В крайнем случае возвращаем false, чтобы не показывать неверное состояние
        return { inWishlist: false };
      }
    } catch (error: unknown) {
      // Если ошибка 409 (конфликт) - товар уже в вишлисте, удаляем его
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        (("status" in error.response && error.response.status === 409) ||
          ("data" in error.response &&
            error.response.data &&
            typeof error.response.data === "object" &&
            "message" in error.response.data &&
            typeof error.response.data.message === "string" &&
            error.response.data.message.includes("already")))
      ) {
        // Пробуем удалить
        try {
          await apiClient.delete(API_ROUTES.wishlist.remove(productId));
          return { inWishlist: false };
        } catch (deleteError) {
          console.error("Failed to remove from wishlist:", deleteError);
          throw deleteError;
        }
      }
      throw error;
    }
  },

  // Проверка наличия товара в избранном
  checkItem: async (productId: number): Promise<boolean> => {
    try {
      const response = await apiClient.get<WishlistCheckResponse>(
        API_ROUTES.wishlist.check(productId),
      );

      if (typeof response.data?.inWishlist === "boolean") {
        return response.data.inWishlist;
      }

      // Если вернулся объект товара, значит он в вишлисте
      return !!(response.data?.id || response.data?.wishlistItem);
    } catch (error: unknown) {
      // Если 404, значит товара нет в вишлисте
      if (
        (error as { response?: { status?: number } }).response?.status === 404
      ) {
        return false;
      }
      throw error;
    }
  },

  // Массовое добавление в корзину
  addAllToCart: async (productIds: number[]): Promise<void> => {
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
