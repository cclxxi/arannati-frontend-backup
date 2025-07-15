import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi /*, type CartItemInput*/ } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/keys";
import { showSuccess } from "@/utils/error";
import type { CartDTO } from "@/types/api";

// Hook для получения товаров в корзине
export function useCartItems() {
  return useQuery({
    queryKey: queryKeys.cart.items(),
    queryFn: cartApi.getItems,
    staleTime: 0, // Всегда свежие данные
  });
}

// Hook для получения количества товаров в корзине
export function useCartCount() {
  return useQuery({
    queryKey: queryKeys.cart.count(),
    queryFn: cartApi.getCount,
    staleTime: 0,
  });
}

// Hook для получения суммарной информации о корзине
export function useCartSummary() {
  const { data: items = [] } = useCartItems();

  return useQuery({
    queryKey: queryKeys.cart.summary(),
    queryFn: () => cartApi.calculateSummary(items),
    enabled: items.length > 0,
  });
}

// Hook для добавления товара в корзину
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.addItem,
    onSuccess: (newItem) => {
      // Обновляем список товаров в корзине
      queryClient.setQueryData<CartDTO[]>(
        queryKeys.cart.items(),
        (oldData = []) => {
          // Проверяем, есть ли уже такой товар
          const existingIndex = oldData.findIndex(
            (item) => item.productId === newItem.productId,
          );

          if (existingIndex >= 0) {
            // Обновляем количество
            const newData = [...oldData];
            newData[existingIndex] = newItem;
            return newData;
          }

          // Добавляем новый товар
          return [...oldData, newItem];
        },
      );

      // Инвалидируем связанные запросы
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.count() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.summary() });

      showSuccess("Товар добавлен в корзину");
    },
  });
}

// Hook для обновления количества товара
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      cartApi.updateItem(id, quantity),
    onMutate: async ({ id, quantity }) => {
      // Отменяем активные запросы
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.items() });

      // Сохраняем предыдущие данные
      const previousItems = queryClient.getQueryData<CartDTO[]>(
        queryKeys.cart.items(),
      );

      // Оптимистичное обновление
      queryClient.setQueryData<CartDTO[]>(
        queryKeys.cart.items(),
        (oldData = []) =>
          oldData.map((item) =>
            item.id === id ? { ...item, quantity } : item,
          ),
      );

      return { previousItems };
    },
    onError: (_err, _variables, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousItems) {
        queryClient.setQueryData(queryKeys.cart.items(), context.previousItems);
      }
    },
    onSettled: async () => {
      // Инвалидируем запросы после завершения
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}

// Hook для удаления товара из корзины
export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.removeItem,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.items() });

      const previousItems = queryClient.getQueryData<CartDTO[]>(
        queryKeys.cart.items(),
      );

      // Оптимистичное удаление
      queryClient.setQueryData<CartDTO[]>(
        queryKeys.cart.items(),
        (oldData = []) => oldData.filter((item) => item.id !== id),
      );

      return { previousItems };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(queryKeys.cart.items(), context.previousItems);
      }
    },
    onSuccess: () => {
      showSuccess("Товар удален из корзины");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}

// Hook для очистки корзины
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: async () => {
      // Очищаем кеш корзины
      queryClient.setQueryData(queryKeys.cart.items(), []);
      queryClient.setQueryData(queryKeys.cart.count(), {
        count: 0,
        totalQuantity: 0,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });

      showSuccess("Корзина очищена");
    },
  });
}

// Hook для валидации корзины
export function useValidateCart() {
  const { data: items = [] } = useCartItems();

  return useMutation({
    mutationFn: () => cartApi.validateCart(items),
  });
}
