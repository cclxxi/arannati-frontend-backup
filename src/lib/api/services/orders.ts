import apiClient from "@/lib/api/client";
import { API_ROUTES } from "@/lib/constants";
import type { OrderDTO, OrderCreateDTO, PaginatedResponse } from "@/types/api";

// Параметры для фильтрации заказов
export interface OrderFilters {
  page?: number;
  size?: number;
  status?: string;
  sort?: string[];
}

// Ответ для расчета доставки
export interface ShippingCalculation {
  shippingCost: number;
  estimatedDays: number;
  freeShippingThreshold?: number;
  freeShippingApplied: boolean;
}

// Ответ для оформления заказа
export interface CheckoutSummary {
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  availablePaymentMethods: string[];
  availableDeliveryMethods: string[];
}

// API методы для заказов
export const ordersApi = {
  // Получение списка заказов пользователя
  getUserOrders: async (
    filters: OrderFilters = {},
  ): Promise<PaginatedResponse<OrderDTO>> => {
    const response = await apiClient.get<PaginatedResponse<OrderDTO>>(
      API_ROUTES.orders.list,
      { params: filters },
    );
    return response.data;
  },

  // Получение деталей заказа
  getOrderDetails: async (id: number): Promise<OrderDTO> => {
    const response = await apiClient.get<OrderDTO>(
      API_ROUTES.orders.details(id),
    );
    return response.data;
  },

  // Создание заказа
  createOrder: async (data: OrderCreateDTO): Promise<OrderDTO> => {
    const response = await apiClient.post<OrderDTO>(
      API_ROUTES.orders.create,
      data,
    );
    return response.data;
  },

  // Получение данных для оформления заказа
  getCheckoutSummary: async (): Promise<CheckoutSummary> => {
    const response = await apiClient.get<CheckoutSummary>(
      API_ROUTES.orders.checkout,
    );
    return response.data;
  },

  // Расчет стоимости доставки
  calculateShipping: async (
    totalAmount: number,
  ): Promise<ShippingCalculation> => {
    const response = await apiClient.get<ShippingCalculation>(
      API_ROUTES.orders.shipping,
      { params: { totalAmount } },
    );
    return response.data;
  },

  // Отмена заказа (для пользователя)
  cancelOrder: async (id: number, reason?: string): Promise<OrderDTO> => {
    // Используем админский эндпоинт, если нет пользовательского
    const response = await apiClient.post<OrderDTO>(
      API_ROUTES.admin.cancelOrder(id),
      { reason },
    );
    return response.data;
  },

  // Повторение заказа
  repeatOrder: async (orderId: number): Promise<void> => {
    // Получаем детали заказа
    const order = await ordersApi.getOrderDetails(orderId);

    // Добавляем товары в корзину
    const { cartApi } = await import("./cart");

    for (const item of order.items) {
      try {
        await cartApi.addItem({
          productId: item.productId,
          quantity: item.quantity,
        });
      } catch (error) {
        console.error(
          `Не удалось добавить товар ${item.productName} в корзину`,
          error,
        );
      }
    }
  },

  // Получение последних заказов
  getRecentOrders: async (limit = 5): Promise<OrderDTO[]> => {
    const response = await ordersApi.getUserOrders({
      size: limit,
      sort: ["createdAt,desc"],
    });
    return response.content;
  },

  // Проверка возможности отмены заказа
  canCancelOrder: (order: OrderDTO): boolean => {
    const cancelableStatuses = ["PENDING", "CONFIRMED"];
    return cancelableStatuses.includes(order.status);
  },

  // Проверка возможности повтора заказа
  canRepeatOrder: (order: OrderDTO): boolean => {
    const completedStatuses = ["DELIVERED", "CANCELLED"];
    return completedStatuses.includes(order.status);
  },

  // Получение статистики по заказам
  getOrderStats: async (): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalSpent: number;
  }> => {
    const allOrders = await ordersApi.getUserOrders({ size: 1000 });
    const orders = allOrders.content;

    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter((o: OrderDTO) =>
        ["PENDING", "CONFIRMED", "PROCESSING"].includes(o.status),
      ).length,
      completedOrders: orders.filter((o: OrderDTO) => o.status === "DELIVERED")
        .length,
      totalSpent: orders.reduce(
        (sum: number, order: OrderDTO) => sum + order.totalAmount,
        0,
      ),
    };
  },
};
