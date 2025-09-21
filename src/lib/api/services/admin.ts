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
    const response = await apiClient.get<UserDTO[]>(API_ROUTES.admin.users, {
      params: { page, size },
    });
    return response.data;
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
    const response = await apiClient.get<UserDTO[]>(
      `${API_ROUTES.admin.cosmetologists}?status=pending`,
    );
    return response.data;
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
    // Filter out undefined values to prevent them from being sent as "undefined" strings
    const filteredParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([value]) => value !== undefined),
        )
      : undefined;

    const response = await apiClient.get<
      PaginatedResponse<ProductDTO> & {
        categories: CategoryDTO[];
        brands: BrandDTO[];
      }
    >(API_ROUTES.admin.products, { params: filteredParams });
    return response.data;
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
    const response = await apiClient.get<CategoryDTO[]>("/api/categories");
    return response.data;
  },

  createCategory: async (
    category: Partial<CategoryDTO>,
  ): Promise<CategoryDTO> => {
    const response = await apiClient.post<CategoryDTO>(
      "/api/admin/categories",
      category,
    );
    return response.data;
  },

  updateCategory: async (
    id: number,
    category: Partial<CategoryDTO>,
  ): Promise<CategoryDTO> => {
    const response = await apiClient.put<CategoryDTO>(
      `/api/admin/categories/${id}`,
      category,
    );
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/categories/${id}`);
  },

  // ===== БРЕНДЫ =====
  getBrands: async (): Promise<BrandDTO[]> => {
    const response = await apiClient.get<BrandDTO[]>("/api/brands");
    return response.data;
  },

  createBrand: async (brand: Partial<BrandDTO>): Promise<BrandDTO> => {
    const response = await apiClient.post<BrandDTO>("/api/admin/brands", brand);
    return response.data;
  },

  updateBrand: async (
    id: number,
    brand: Partial<BrandDTO>,
  ): Promise<BrandDTO> => {
    const response = await apiClient.put<BrandDTO>(
      `/api/admin/brands/${id}`,
      brand,
    );
    return response.data;
  },

  deleteBrand: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/brands/${id}`);
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

    await apiClient.post(API_ROUTES.admin.materials, formData, {
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
    >(API_ROUTES.admin.materials);
    return response.data;
  },

  deleteMaterial: async (id: number): Promise<void> => {
    await apiClient.delete(API_ROUTES.admin.material(id));
  },
};
