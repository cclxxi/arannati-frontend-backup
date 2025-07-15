import apiClient from "@/lib/api/client";
import { API_ROUTES } from "@/lib/constants";
import type { CartDTO } from "@/types/api";

// Типы для работы с корзиной
export interface CartItemInput {
  productId: number;
  quantity: number;
}

export interface CartSummary {
  items: CartDTO[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  discount: number;
  total: number;
}

export interface CartCountResponse {
  count: number;
  totalQuantity: number;
}

// API методы для корзины
export const cartApi = {
  // Получение товаров в корзине
  getItems: async (): Promise<CartDTO[]> => {
    const response = await apiClient.get<CartDTO[]>(API_ROUTES.cart.list);
    return response.data;
  },

  // Добавление товара в корзину
  addItem: async (data: CartItemInput): Promise<CartDTO> => {
    const response = await apiClient.post<CartDTO>(API_ROUTES.cart.add, {
      ...data,
      userId: 0, // Будет заполнено на бэкенде из токена
    });
    return response.data;
  },

  // Обновление количества товара
  updateItem: async (id: number, quantity: number): Promise<CartDTO> => {
    const response = await apiClient.put<CartDTO>(API_ROUTES.cart.update(id), {
      id,
      quantity,
      userId: 0, // Будет заполнено на бэкенде
      productId: 0, // Будет заполнено на бэкенде
    });
    return response.data;
  },

  // Удаление товара из корзины
  removeItem: async (id: number): Promise<void> => {
    await apiClient.delete(API_ROUTES.cart.remove(id));
  },

  // Очистка корзины
  clearCart: async (): Promise<void> => {
    await apiClient.delete(API_ROUTES.cart.clear);
  },

  // Получение количества товаров в корзине
  getCount: async (): Promise<CartCountResponse> => {
    const response = await apiClient.get<CartCountResponse>(
      API_ROUTES.cart.count,
    );
    return response.data;
  },

  // Вспомогательная функция для расчета суммы корзины
  calculateSummary: (items: CartDTO[]): CartSummary => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => {
      const price =
        item.product?.effectivePrice || item.product?.regularPrice || 0;
      return sum + price * item.quantity;
    }, 0);

    // Расчет скидки
    const discount = items.reduce((sum, item) => {
      if (!item.product?.hasDiscount) return sum;
      const regularPrice = item.product.regularPrice || 0;
      const effectivePrice = item.product.effectivePrice || regularPrice;
      const itemDiscount = (regularPrice - effectivePrice) * item.quantity;
      return sum + itemDiscount;
    }, 0);

    return {
      items,
      totalItems: items.length,
      totalQuantity,
      subtotal: subtotal + discount, // Сумма без скидки
      discount,
      total: subtotal,
    };
  },

  // Проверка доступности товаров в корзине
  validateCart: async (
    items: CartDTO[],
  ): Promise<{
    valid: boolean;
    errors: string[];
  }> => {
    const errors: string[] = [];

    for (const item of items) {
      if (!item.product) {
        errors.push(`Товар #${item.productId} не найден`);
        continue;
      }

      if (!item.product.active) {
        errors.push(`Товар "${item.product.name}" недоступен`);
      }

      if (item.quantity > item.product.stockQuantity) {
        errors.push(
          `Товар "${item.product.name}" доступен в количестве ${item.product.stockQuantity} шт.`,
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};
