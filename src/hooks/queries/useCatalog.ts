import {
  useQuery,
  useInfiniteQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";
import { catalogApi, type CatalogFilters } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/keys";
/*import { config } from '@/lib/config';*/

// Hook для получения списка товаров с пагинацией
export function useProducts(filters: CatalogFilters = {}) {
  return useQuery({
    queryKey: queryKeys.catalog.products(filters as Record<string, unknown>),
    queryFn: () => catalogApi.getProducts(filters),
    placeholderData: keepPreviousData, // Сохраняем предыдущие данные при смене страницы
  });
}

// Hook для бесконечной прокрутки товаров
export function useInfiniteProducts(
  filters: Omit<CatalogFilters, "page"> = {},
) {
  return useInfiniteQuery({
    queryKey: queryKeys.catalog.products(filters as Record<string, unknown>),
    queryFn: ({ pageParam = 0 }) =>
      catalogApi.getProducts({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      // Если это последняя страница, возвращаем undefined
      if (lastPage.last) return undefined;
      // Иначе возвращаем номер следующей страницы
      return lastPage.number + 1;
    },
    initialPageParam: 0,
  });
}

// Hook для получения детальной информации о товаре
export function useProduct(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.catalog.product(id),
    queryFn: () => catalogApi.getProductDetails(id),
    enabled: enabled && id > 0,
    staleTime: 10 * 60 * 1000, // 10 минут
  });
}

// Hook для поиска товаров
export function useProductSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.catalog.search(query),
    queryFn: () => catalogApi.searchProducts(query),
    enabled: enabled && query.length >= 2, // Минимум 2 символа для поиска
    staleTime: 30 * 1000, // 30 секунд
  });
}

// Hook для популярных товаров
export function usePopularProducts() {
  return useQuery({
    queryKey: queryKeys.catalog.popular(),
    queryFn: () => catalogApi.getPopularProducts(),
    staleTime: 60 * 60 * 1000, // 1 час
  });
}

// Hook для товаров со скидкой
export function useSaleProducts() {
  return useQuery({
    queryKey: queryKeys.catalog.sale(),
    queryFn: () => catalogApi.getSaleProducts(),
    staleTime: 30 * 60 * 1000, // 30 минут
  });
}

// Hook для новинок
export function useNewProducts() {
  return useQuery({
    queryKey: queryKeys.catalog.new(),
    queryFn: () => catalogApi.getNewProducts(),
    staleTime: 60 * 60 * 1000, // 1 час
  });
}

// Hook для похожих товаров
export function useSimilarProducts(productId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.catalog.similar(productId),
    queryFn: () => catalogApi.getSimilarProducts(productId),
    enabled: enabled && productId > 0,
    staleTime: 60 * 60 * 1000, // 1 час
  });
}

// Hook для предварительной загрузки товара
export function usePrefetchProduct() {
  const queryClient = useQueryClient();

  return async (id: number) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.catalog.product(id),
      queryFn: () => catalogApi.getProductDetails(id),
      staleTime: 10 * 60 * 1000,
    });
  };
}
