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

interface BrandDTO {
  id: number;
  name: string;
  slug?: string;
}

interface CategoryDTO {
  id: number;
  name: string;
  parentId?: number;
  slug?: string;
}

// Нормализатор контента ответа (поддерживает и пагинацию, и массив)
function normalizeContent<T>(
  data: PaginatedResponse<T> | T[] | undefined,
): T[] {
  if (!data) return [];
  return Array.isArray(data) ? data : (data.content ?? []);
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

    // Готовим сырые параметры
    const rawParams = {
      page: filters?.page ?? 0,
      size: filters?.size ?? 20,
      sort: sortParams || "sortOrder,asc",
      search: filters?.search?.trim() || undefined,
      categoryId:
        typeof filters?.categoryId === "number" &&
        Number.isFinite(filters.categoryId)
          ? filters.categoryId
          : undefined,
      brandId:
        typeof filters?.brandId === "number" && Number.isFinite(filters.brandId)
          ? filters.brandId
          : undefined,
      minPrice:
        typeof filters?.minPrice === "number" &&
        Number.isFinite(filters.minPrice)
          ? filters.minPrice
          : undefined,
      maxPrice:
        typeof filters?.maxPrice === "number" &&
        Number.isFinite(filters.maxPrice)
          ? filters.maxPrice
          : undefined,
      onSale: typeof filters?.onSale === "boolean" ? filters.onSale : undefined,
      professional:
        typeof filters?.professional === "boolean"
          ? filters.professional
          : undefined,
    };

    // Очищаем параметры от undefined/null/пустых строк
    const params: Record<string, string | number | boolean> = {};
    Object.entries(rawParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params[key] = value as string | number | boolean;
      }
    });

    // Важно: используем обычный get, но только с очищенными params
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
    const response = await apiClient.get<
      PaginatedResponse<CategoryDTO> | CategoryDTO[]
    >("/catalog/categories");

    const list = normalizeContent<CategoryDTO>(response.data);

    return list
      .map((c): { id: number; name: string } | null => {
        if (typeof c.id !== "number" || typeof c.name !== "string") return null;
        return { id: c.id, name: c.name };
      })
      .filter((v): v is { id: number; name: string } => v !== null);
  },

  // Получение брендов
  getBrands: async (): Promise<Array<{ id: number; name: string }>> => {
    const response = await apiClient.get<
      PaginatedResponse<BrandDTO> | BrandDTO[]
    >("/catalog/brands");

    const list = normalizeContent<BrandDTO>(response.data);

    return list
      .map((b): { id: number; name: string } | null => {
        if (typeof b.id !== "number" || typeof b.name !== "string") return null;
        return { id: b.id, name: b.name };
      })
      .filter((v): v is { id: number; name: string } => v !== null);
  },
};
