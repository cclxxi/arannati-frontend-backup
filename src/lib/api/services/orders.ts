import apiClient from "@/lib/api/client";
import { API_ROUTES } from "@/lib/constants";
import type { OrderDTO, OrderCreateDTO, PaginatedResponse } from "@/types/api";

type WithData<T> = { data: T };

interface BackendPaginatedResponse<T> {
  content?: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  currentPage?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
  numberOfElements?: number;
}

const isObject = (val: unknown): val is Record<string, unknown> =>
  typeof val === "object" && val !== null;

const isWithData = <T>(val: unknown): val is WithData<T> =>
  isObject(val) && "data" in val;

const isPaginatedResponse = <T>(val: unknown): val is PaginatedResponse<T> =>
  isObject(val) && Array.isArray((val as { content?: unknown }).content);

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

// Дефолтная структура для пустого ответа
const EMPTY_PAGINATED_RESPONSE: PaginatedResponse<OrderDTO> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0,
  first: true,
  last: true,
  empty: true,
  numberOfElements: 0,
};

// API методы для заказов
export const ordersApi = {
  // Получение списка заказов пользователя
  getUserOrders: async (
    filters: OrderFilters = {},
  ): Promise<PaginatedResponse<OrderDTO>> => {
    try {
      const response = await apiClient.get<
        | PaginatedResponse<OrderDTO>
        | WithData<BackendPaginatedResponse<OrderDTO>>
      >(API_ROUTES.orders.list, { params: filters });

      // Проверяем структуру ответа
      if (!response.data) {
        console.warn("No data in orders response");
        return EMPTY_PAGINATED_RESPONSE;
      }

      // Если backend вернул данные в поле data
      if (isWithData<BackendPaginatedResponse<OrderDTO>>(response.data)) {
        const innerData = response.data.data;

        return {
          content: innerData.content || [],
          totalElements: innerData.totalElements || 0,
          totalPages: innerData.totalPages || 0,
          size: innerData.size || filters.size || 10,
          number: innerData.currentPage || 0,
          first: innerData.first ?? true,
          last: innerData.last ?? true,
          empty:
            innerData.empty ??
            (!innerData.content || innerData.content.length === 0),
          numberOfElements: innerData.numberOfElements || 0,
        };
      }

      // Если данные уже в правильном формате
      if (isPaginatedResponse<OrderDTO>(response.data)) {
        return {
          content: response.data.content || [],
          totalElements: response.data.totalElements || 0,
          totalPages: response.data.totalPages || 0,
          size: response.data.size || filters.size || 10,
          number: response.data.number || 0,
          first: response.data.first ?? true,
          last: response.data.last ?? true,
          empty: response.data.empty ?? true,
          numberOfElements: response.data.numberOfElements || 0,
        };
      }

      // Непредвиденный формат — возвращаем дефолт
      console.warn("Unexpected orders response format:", response.data);
      return EMPTY_PAGINATED_RESPONSE;
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      return EMPTY_PAGINATED_RESPONSE;
    }
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
    try {
      const response = await apiClient.get<CheckoutSummary>(
        API_ROUTES.orders.checkout,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch checkout summary:", error);
      // Возвращаем пустую структуру
      return {
        items: [],
        subtotal: 0,
        discount: 0,
        shippingCost: 0,
        total: 0,
        availablePaymentMethods: [],
        availableDeliveryMethods: [],
      };
    }
  },

  // Расчет стоимости доставки
  calculateShipping: async (
    totalAmount: number,
  ): Promise<ShippingCalculation> => {
    try {
      const response = await apiClient.get<
        ShippingCalculation | WithData<ShippingCalculation>
      >(API_ROUTES.orders.shipping, { params: { totalAmount } });

      // Обработка ответа от backend
      if (isWithData<ShippingCalculation>(response.data)) {
        return response.data.data;
      }

      return response.data;
    } catch (error) {
      console.error("Failed to calculate shipping:", error);
      // Возвращаем дефолтные значения
      return {
        shippingCost: 0,
        estimatedDays: 3,
        freeShippingThreshold: 10000,
        freeShippingApplied: false,
      };
    }
  },

  // Отмена заказа (для пользователя)
  cancelOrder: async (id: number, reason?: string): Promise<OrderDTO> => {
    const response = await apiClient.post<OrderDTO>(
      `/api/orders/${id}/cancel`,
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
    try {
      const response = await ordersApi.getUserOrders({
        size: limit,
        sort: ["createdAt,desc"],
      });
      return response.content || [];
    } catch (error) {
      console.error("Failed to fetch recent orders:", error);
      return [];
    }
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
    try {
      const response = await ordersApi.getUserOrders({ size: 1000 });

      // Проверяем что есть content
      const orders = response?.content || [];

      // Если нет заказов, возвращаем нули
      if (!Array.isArray(orders)) {
        console.warn("Orders is not an array:", orders);
        return {
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalSpent: 0,
        };
      }

      return {
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: OrderDTO) =>
          ["PENDING", "CONFIRMED", "PROCESSING"].includes(o.status),
        ).length,
        completedOrders: orders.filter(
          (o: OrderDTO) => o.status === "DELIVERED",
        ).length,
        totalSpent: orders.reduce(
          (sum: number, order: OrderDTO) => sum + (order.totalAmount || 0),
          0,
        ),
      };
    } catch (error) {
      console.error("Failed to calculate order stats:", error);
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalSpent: 0,
      };
    }
  },
};
