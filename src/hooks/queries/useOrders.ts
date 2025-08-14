import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ordersApi, type OrderFilters } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/keys";
import { showSuccess } from "@/utils/error";
import { APP_ROUTES } from "@/constants";
import type { OrderDTO } from "@/types/api";

// Hook для получения списка заказов
export function useOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: queryKeys.orders.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const result = await ordersApi.getUserOrders(filters);
      // Гарантируем возвращение объекта, а не undefined
      return result || { content: [], totalElements: 0, totalPages: 0 };
    },
    // Разрешаем запрос даже если пользователь не авторизован
    // так как эндпоинт публичный для дашборда
    retry: false,
  });
}

// Hook для получения последних заказов
export function useRecentOrders(limit = 5) {
  return useQuery({
    queryKey: [...queryKeys.orders.list({ size: limit }), "recent"],
    queryFn: async () => {
      try {
        const result = await ordersApi.getRecentOrders(limit);
        // Всегда возвращаем массив, даже если пустой
        return result || [];
      } catch (error) {
        console.error("Failed to fetch recent orders:", error);
        // Возвращаем пустой массив в случае ошибки
        return [];
      }
    },
    // Не показываем ошибку если нет заказов
    retry: false,
    // Кэшируем на 1 минуту
    staleTime: 60 * 1000,
  });
}

// Hook для получения деталей заказа
export function useOrderDetails(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: async () => {
      if (!id || id <= 0) {
        throw new Error("Invalid order ID");
      }
      return await ordersApi.getOrderDetails(id);
    },
    enabled: enabled && id > 0,
  });
}

// Hook для получения данных для оформления заказа
export function useCheckoutSummary() {
  return useQuery({
    queryKey: queryKeys.orders.checkout(),
    queryFn: async () => {
      const result = await ordersApi.getCheckoutSummary();
      // Гарантируем возвращение объекта
      return (
        result || {
          items: [],
          subtotal: 0,
          discount: 0,
          shippingCost: 0,
          total: 0,
          availablePaymentMethods: [],
          availableDeliveryMethods: [],
        }
      );
    },
    staleTime: 0, // Всегда свежие данные
  });
}

// Hook для расчета стоимости доставки
export function useShippingCalculation(totalAmount: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.orders.shipping(totalAmount),
    queryFn: async () => {
      if (totalAmount <= 0) {
        return {
          shippingCost: 0,
          estimatedDays: 3,
          freeShippingThreshold: 10000,
          freeShippingApplied: false,
        };
      }
      return await ordersApi.calculateShipping(totalAmount);
    },
    enabled: enabled && totalAmount > 0,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

// Hook для создания заказа
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: async (order: OrderDTO) => {
      // Очищаем корзину
      queryClient.setQueryData(queryKeys.cart.items(), []);
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });

      // Инвалидируем список заказов
      await queryClient.invalidateQueries({
        queryKey: queryKeys.orders.list(),
      });

      showSuccess(`Заказ №${order.orderNumber} успешно оформлен!`);

      // Редирект на страницу заказа
      router.push(`${APP_ROUTES.user.orders}/${order.id}`);
    },
  });
}

// Hook для отмены заказа
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      ordersApi.cancelOrder(id, reason),
    onSuccess: async (order: OrderDTO) => {
      // Обновляем детали заказа в кеше
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);

      // Инвалидируем список заказов
      await queryClient.invalidateQueries({
        queryKey: queryKeys.orders.list(),
      });

      showSuccess("Заказ успешно отменен");
    },
  });
}

// Hook для повтора заказа
export function useRepeatOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ordersApi.repeatOrder,
    onSuccess: async () => {
      // Инвалидируем корзину
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });

      showSuccess("Товары добавлены в корзину");

      // Редирект в корзину
      router.push(APP_ROUTES.user.cart);
    },
  });
}

// Hook для получения статистики заказов
export function useOrderStats() {
  return useQuery({
    queryKey: queryKeys.orders.stats(),
    queryFn: async () => {
      try {
        const result = await ordersApi.getOrderStats();
        // Гарантируем возвращение объекта со всеми полями
        return (
          result || {
            totalOrders: 0,
            pendingOrders: 0,
            completedOrders: 0,
            totalSpent: 0,
          }
        );
      } catch (error) {
        console.error("Failed to fetch order stats:", error);
        // Возвращаем дефолтные значения в случае ошибки
        return {
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalSpent: 0,
        };
      }
    },
    staleTime: 10 * 60 * 1000, // 10 минут
    retry: false,
  });
}

// Hook для предварительной загрузки заказа
export function usePrefetchOrder() {
  const queryClient = useQueryClient();

  return async (id: number) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.orders.detail(id),
      queryFn: () => ordersApi.getOrderDetails(id),
    });
  };
}
