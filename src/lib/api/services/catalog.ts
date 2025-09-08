import apiClient from "@/lib/api/client";
import { API_ROUTES } from "@/lib/constants";
import type { ProductDTO, PaginatedResponse } from "@/types/api";

// Параметры для фильтрации каталога
export interface CatalogFilters {
  categoryId?: number;
  brandId?: number;
  professional?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  onSale?: boolean;
  page?: number;
  size?: number;
  sort?: string | string[];
}

// API методы для каталога
export const catalogApi = {
  // Получение списка товаров
  getProducts: async (
    filters?: CatalogFilters,
  ): Promise<PaginatedResponse<ProductDTO>> => {
    // Преобразуем sort в правильный формат для бэкенда
    let sortParams = filters?.sort;
    if (Array.isArray(sortParams)) {
      sortParams = sortParams.join(",");
    }

    const params = {
      ...filters,
      sort: sortParams || "sortOrder,asc",
    };

    const response = await apiClient.get<PaginatedResponse<ProductDTO>>(
      API_ROUTES.catalog.products,
      { params },
    );
    return response.data;
  },

  // Получение детальной информации о товаре
  getProductDetails: async (id: number): Promise<ProductDTO> => {
    const response = await apiClient.get<ProductDTO>(
      API_ROUTES.catalog.productDetails(id),
    );
    return response.data;
  },

  // Поиск товаров
  searchProducts: async (query: string, limit = 10): Promise<ProductDTO[]> => {
    const response = await apiClient.get<PaginatedResponse<ProductDTO>>(
      API_ROUTES.catalog.products,
      {
        params: {
          search: query,
          size: limit,
          sort: "relevance,desc",
        },
      },
    );
    return response.data.content;
  },

  // Получение популярных товаров
  getPopularProducts: async (limit = 8): Promise<ProductDTO[]> => {
    const response = await apiClient.get<PaginatedResponse<ProductDTO>>(
      API_ROUTES.catalog.products,
      {
        params: {
          size: limit,
          sort: "averageRating,desc",
        },
      },
    );
    return response.data.content;
  },

  // Получение товаров со скидкой
  getSaleProducts: async (limit = 8): Promise<ProductDTO[]> => {
    const response = await apiClient.get<PaginatedResponse<ProductDTO>>(
      API_ROUTES.catalog.products,
      {
        params: {
          size: limit,
          sort: "discountPercentage,desc",
        },
      },
    );
    return response.data.content.filter((product) => product.hasDiscount);
  },

  // Получение новинок
  getNewProducts: async (limit = 8): Promise<ProductDTO[]> => {
    const response = await apiClient.get<PaginatedResponse<ProductDTO>>(
      API_ROUTES.catalog.products,
      {
        params: {
          size: limit,
          sort: "createdAt,desc",
        },
      },
    );
    return response.data.content;
  },

  // Получение похожих товаров
  getSimilarProducts: async (
    productId: number,
    limit = 4,
  ): Promise<ProductDTO[]> => {
    // Сначала получаем информацию о товаре
    const product = await catalogApi.getProductDetails(productId);

    // Затем ищем товары той же категории
    const response = await apiClient.get<PaginatedResponse<ProductDTO>>(
      API_ROUTES.catalog.products,
      {
        params: {
          categoryId: product.categoryId,
          size: limit + 1, // +1 чтобы исключить текущий товар
          sort: "averageRating,desc",
        },
      },
    );

    // Фильтруем текущий товар из результатов
    return response.data.content
      .filter((p) => p.id !== productId)
      .slice(0, limit);
  },

  // Получение категорий
  getCategories: async (): Promise<Array<{ id: number; name: string }>> => {
    // Временная заглушка - возвращаем пустой массив
    // В реальном проекте здесь должен быть запрос к API
    return [];
  },

  // Получение брендов
  getBrands: async (): Promise<Array<{ id: number; name: string }>> => {
    // Временная заглушка - возвращаем пустой массив
    // В реальном проекте здесь должен быть запрос к API
    return [];
  },
};
