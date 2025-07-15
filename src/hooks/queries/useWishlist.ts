import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/keys";
import { showSuccess } from "@/utils/error";
import type { WishlistItemDTO, ProductDTO } from "@/types/api";

// Hook для получения списка избранного
export function useWishlistItems() {
  return useQuery({
    queryKey: queryKeys.wishlist.items(),
    queryFn: wishlistApi.getItems,
  });
}

// Hook для получения количества товаров в избранном
export function useWishlistCount() {
  const { data: items = [] } = useWishlistItems();

  return {
    count: items.length,
    isLoading: false,
  };
}

// Hook для проверки товара в избранном
export function useIsInWishlist(productId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.wishlist.check(productId),
    queryFn: () => wishlistApi.checkItem(productId),
    enabled: enabled && productId > 0,
    staleTime: 0,
  });
}

// Hook для добавления в избранное
export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistApi.addItem,
    onSuccess: (newItem) => {
      // Обновляем список избранного
      queryClient.setQueryData<WishlistItemDTO[]>(
        queryKeys.wishlist.items(),
        (oldData = []) => [...oldData, newItem],
      );

      // Обновляем статус товара
      queryClient.setQueryData(
        queryKeys.wishlist.check(newItem.productId),
        true,
      );

      // Обновляем товар в каталоге
      queryClient.setQueriesData<ProductDTO>(
        { queryKey: queryKeys.catalog.product(newItem.productId) },
        (oldData) => (oldData ? { ...oldData, inWishlist: true } : oldData),
      );

      showSuccess("Товар добавлен в избранное");
    },
  });
}

// Hook для удаления из избранного
export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistApi.removeItem,
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.wishlist.items() });

      const previousItems = queryClient.getQueryData<WishlistItemDTO[]>(
        queryKeys.wishlist.items(),
      );

      // Оптимистичное удаление
      queryClient.setQueryData<WishlistItemDTO[]>(
        queryKeys.wishlist.items(),
        (oldData = []) =>
          oldData.filter((item) => item.productId !== productId),
      );

      // Обновляем статус
      queryClient.setQueryData(queryKeys.wishlist.check(productId), false);

      return { previousItems };
    },
    onError: (_err, productId, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(
          queryKeys.wishlist.items(),
          context.previousItems,
        );
        queryClient.setQueryData(queryKeys.wishlist.check(productId), true);
      }
    },
    onSuccess: (_, productId) => {
      // Обновляем товар в каталоге
      queryClient.setQueriesData<ProductDTO>(
        { queryKey: queryKeys.catalog.product(productId) },
        (oldData) => (oldData ? { ...oldData, inWishlist: false } : oldData),
      );

      showSuccess("Товар удален из избранного");
    },
  });
}

// Hook для переключения статуса в избранном
export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistApi.toggleItem,
    onMutate: async (productId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.wishlist.check(productId),
      });

      const previousStatus = queryClient.getQueryData<boolean>(
        queryKeys.wishlist.check(productId),
      );

      // Оптимистичное обновление
      queryClient.setQueryData(
        queryKeys.wishlist.check(productId),
        !previousStatus,
      );

      return { previousStatus };
    },
    onError: (_err, productId, context) => {
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData(
          queryKeys.wishlist.check(productId),
          context.previousStatus,
        );
      }
    },
    onSuccess: async ({ inWishlist }, productId) => {
      // Инвалидируем список избранного
      await queryClient.invalidateQueries({
        queryKey: queryKeys.wishlist.items(),
      });

      // Обновляем товар в каталоге
      queryClient.setQueriesData<ProductDTO>(
        { queryKey: queryKeys.catalog.product(productId) },
        (oldData) => (oldData ? { ...oldData, inWishlist } : oldData),
      );

      showSuccess(
        inWishlist
          ? "Товар добавлен в избранное"
          : "Товар удален из избранного",
      );
    },
  });
}

// Hook для массового добавления в корзину
export function useAddAllToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productIds: number[]) => wishlistApi.addAllToCart(productIds),
    onSuccess: async () => {
      // Инвалидируем корзину
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });

      showSuccess("Все товары добавлены в корзину");
    },
  });
}
