// src/lib/api/services/admin.ts
import apiClient from "@/lib/api/client";
import { API_ROUTES } from "@/lib/constants";
import type {
  UserDTO,
  ProductDTO,
  OrderDTO,
  CategoryDTO,
  BrandDTO,
  ReviewDTO,
} from "@/types/api";

interface PaginatedResponse<T> {
  content: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

interface StatsResponse {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingCosmetologists: number;
  todayOrders: number;
  monthlyRevenue: number;
}

export const adminApi = {
  // ===== СТАТИСТИКА =====
  getStats: async (): Promise<StatsResponse> => {
    const response = await apiClient.get<StatsResponse>(API_ROUTES.admin.stats);
    return response.data;
  },

  // ===== ПОЛЬЗОВАТЕЛИ =====
  getUsers: async (page = 0, size = 20): Promise<UserDTO[]> => {
    const response = await apiClient.get<unknown>(API_ROUTES.admin.users, {
      params: { page, size },
    });

    // Универсальная нормализация: поддерживаем массив и pageable-формат
    const data = response.data as
      | UserDTO[]
      | { content?: UserDTO[]; items?: UserDTO[]; data?: UserDTO[] };

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content!;
    if (Array.isArray(data?.items)) return data.items!;
    if (
      typeof data === "object" &&
      data !== null &&
      "data" in data &&
      Array.isArray(data.data)
    ) {
      return data.data as UserDTO[];
    }

    return [];
  },

  toggleUserActive: async (userId: number): Promise<void> => {
    await apiClient.post(API_ROUTES.admin.toggleUserActive(userId));
  },

  sendMessageToUser: async (userId: number, message: string): Promise<void> => {
    await apiClient.post(API_ROUTES.admin.sendMessage(userId), null, {
      params: { message },
    });
  },

  // ===== КОСМЕТОЛОГИ =====
  getPendingCosmetologists: async (): Promise<UserDTO[]> => {
    try {
      // Пробуем специальный endpoint для pending косметологов (без лишнего /api)
      const response = await apiClient.get<UserDTO[]>(
        "/admin/cosmetologists/pending",
      );
      return response.data;
    } catch {
      // Если спец. эндпоинта нет — fallback
      const all = await adminApi.getUsers(0, 1000);
      return all.filter((u) => u.role === "COSMETOLOGIST" && !u.verified);
    }
  },

  getAllCosmetologists: async (): Promise<{
    pending: UserDTO[];
    approved: UserDTO[];
    declined: UserDTO[];
  }> => {
    try {
      // Подтянем побольше, чтобы не упереться в пагинацию
      const users = await adminApi.getUsers(0, 1000);

      const pending = users.filter(
        (u) => u.role === "COSMETOLOGIST" && !u.verified && u.active !== false,
      );
      const approved = users.filter(
        (u) => u.role === "COSMETOLOGIST" && u.verified === true,
      );
      const declined = users.filter(
        (u) => u.role === "COSMETOLOGIST" && u.active === false && !u.verified,
      );

      return { pending, approved, declined };
    } catch (error) {
      console.error("Error getting cosmetologists:", error);
      return { pending: [], approved: [], declined: [] };
    }
  },

  approveCosmetologist: async (id: number): Promise<void> => {
    await apiClient.post(API_ROUTES.admin.approveCosmetologist(id));
  },

  declineCosmetologist: async (id: number, reason: string): Promise<void> => {
    await apiClient.post(API_ROUTES.admin.declineCosmetologist(id), null, {
      params: { reason },
    });
  },

  // ===== ТОВАРЫ =====
  getProducts: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    categoryId?: number;
    brandId?: number;
  }): Promise<
    PaginatedResponse<ProductDTO> & {
      categories: CategoryDTO[];
      brands: BrandDTO[];
    }
  > => {
    // Преобразуем параметры в правильные типы
    const queryParams: Record<string, string | number | undefined> = {};
    if (params) {
      if (params.page !== undefined) queryParams["page"] = Number(params.page);
      if (params.size !== undefined) queryParams["size"] = Number(params.size);
      if (params.search) queryParams["search"] = params.search;
      if (params.categoryId !== undefined)
        queryParams["categoryId"] = Number(params.categoryId);
      if (params.brandId !== undefined)
        queryParams["brandId"] = Number(params.brandId);
    }

    // Filter out undefined values for API client compatibility
    const cleanParams: Record<string, string | number | boolean> = {};
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanParams[key] = value;
      }
    });

    // 1) Товары (поддержка pageable и массива)
    const productsResp = await apiClient.get<unknown>(
      API_ROUTES.admin.products,
      {
        params: cleanParams,
      },
    );

    const raw = productsResp.data as Record<string, unknown> | ProductDTO[];
    const content: ProductDTO[] = Array.isArray(raw)
      ? raw
      : (((raw as Record<string, unknown>)["content"] as ProductDTO[]) ??
        ((raw as Record<string, unknown>)["items"] as ProductDTO[]) ??
        ((raw as Record<string, unknown>)["data"] as ProductDTO[]) ??
        []);

    const totalItems = !Array.isArray(raw)
      ? (((raw as Record<string, unknown>)["totalElements"] as number) ??
        ((raw as Record<string, unknown>)["totalItems"] as number) ??
        content.length)
      : content.length;
    const totalPages = !Array.isArray(raw)
      ? (((raw as Record<string, unknown>)["totalPages"] as number) ??
        (typeof totalItems === "number" && params?.size
          ? Math.ceil(totalItems / Number(params.size))
          : 1))
      : 1;
    const currentPage = !Array.isArray(raw)
      ? (((raw as Record<string, unknown>)["number"] as number) ??
        ((raw as Record<string, unknown>)["currentPage"] as number) ??
        params?.page ??
        0)
      : (params?.page ?? 0);

    // 2) Категории и бренды — отдельными вызовами (на случай если бэк не возвращает их вместе)
    const [categoriesResp, brandsResp] = await Promise.all([
      apiClient
        .get<CategoryDTO[]>("/categories")
        .catch(() => ({ data: [] as CategoryDTO[] })),
      apiClient
        .get<BrandDTO[]>("/brands")
        .catch(() => ({ data: [] as BrandDTO[] })),
    ]);

    return {
      content,
      currentPage,
      totalItems,
      totalPages,
      categories: categoriesResp.data || [],
      brands: brandsResp.data || [],
    };
  },

  getProduct: async (id: number): Promise<ProductDTO> => {
    const response = await apiClient.get<ProductDTO>(
      API_ROUTES.admin.product(id),
    );
    return response.data;
  },

  createProduct: async (product: Partial<ProductDTO>): Promise<ProductDTO> => {
    const response = await apiClient.post<ProductDTO>(
      API_ROUTES.admin.products,
      product,
    );
    return response.data;
  },

  updateProduct: async (
    id: number,
    product: Partial<ProductDTO>,
  ): Promise<ProductDTO> => {
    const response = await apiClient.put<ProductDTO>(
      API_ROUTES.admin.product(id),
      product,
    );
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(API_ROUTES.admin.product(id));
  },

  uploadProductImage: async (
    productId: number,
    file: File,
    isMain: boolean = false,
  ): Promise<void> => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("isMain", String(isMain));

    await apiClient.post(
      `${API_ROUTES.admin.product(productId)}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },

  deleteProductImage: async (
    productId: number,
    imageId: number,
  ): Promise<void> => {
    await apiClient.delete(
      `${API_ROUTES.admin.product(productId)}/images/${imageId}`,
    );
  },

  // ===== КАТЕГОРИИ =====
  getCategories: async (): Promise<CategoryDTO[]> => {
    const response = await apiClient.get<CategoryDTO[]>("/categories");
    return response.data;
  },

  createCategory: async (
    category: Partial<CategoryDTO>,
  ): Promise<CategoryDTO> => {
    const response = await apiClient.post<CategoryDTO>(
      "/admin/categories",
      category,
    );
    return response.data;
  },

  updateCategory: async (
    id: number,
    category: Partial<CategoryDTO>,
  ): Promise<CategoryDTO> => {
    const response = await apiClient.put<CategoryDTO>(
      `/admin/categories/${id}`,
      category,
    );
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/categories/${id}`);
  },

  // ===== БРЕНДЫ =====
  getBrands: async (): Promise<BrandDTO[]> => {
    const response = await apiClient.get<BrandDTO[]>("/brands");
    return response.data;
  },

  createBrand: async (brand: Partial<BrandDTO>): Promise<BrandDTO> => {
    const response = await apiClient.post<BrandDTO>("/admin/brands", brand);
    return response.data;
  },

  updateBrand: async (
    id: number,
    brand: Partial<BrandDTO>,
  ): Promise<BrandDTO> => {
    const response = await apiClient.put<BrandDTO>(
      `/admin/brands/${id}`,
      brand,
    );
    return response.data;
  },

  deleteBrand: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/brands/${id}`);
  },

  // ===== ЗАКАЗЫ =====
  getOrders: async (params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<PaginatedResponse<OrderDTO>> => {
    const response = await apiClient.get<PaginatedResponse<OrderDTO>>(
      API_ROUTES.admin.orders,
      { params },
    );
    return response.data;
  },

  getOrder: async (id: number): Promise<OrderDTO> => {
    const response = await apiClient.get<OrderDTO>(
      API_ROUTES.admin.orderDetails(id),
    );
    return response.data;
  },

  updateOrderStatus: async (id: number, status: string): Promise<void> => {
    await apiClient.post(API_ROUTES.admin.updateOrderStatus(id), null, {
      params: { status },
    });
  },

  cancelOrder: async (id: number): Promise<void> => {
    await apiClient.post(API_ROUTES.admin.cancelOrder(id));
  },

  // ===== ОТЗЫВЫ =====
  getReviews: async (productId?: number): Promise<ReviewDTO[]> => {
    const response = await apiClient.get<ReviewDTO[]>(
      API_ROUTES.admin.reviews,
      {
        params: productId ? { productId } : undefined,
      },
    );
    return response.data;
  },

  deleteReview: async (id: number): Promise<void> => {
    await apiClient.delete(API_ROUTES.admin.deleteReview(id));
  },

  // ===== МАТЕРИАЛЫ ДЛЯ КОСМЕТОЛОГОВ =====
  uploadMaterial: async (
    file: File,
    title: string,
    description: string,
  ): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);

    await apiClient.post("/admin/materials", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getMaterials: async (): Promise<
    Array<{
      id: number;
      title: string;
      description: string;
      fileName: string;
      fileSize: number;
      uploadDate: string;
    }>
  > => {
    const response = await apiClient.get<
      Array<{
        id: number;
        title: string;
        description: string;
        fileName: string;
        fileSize: number;
        uploadDate: string;
      }>
    >("/admin/materials");
    return response.data;
  },

  deleteMaterial: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/materials/${id}`);
  },
};
