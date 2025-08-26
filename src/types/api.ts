// Базовые типы для API ответов
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// User типы
export interface UserDTO {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "USER" | "COSMETOLOGIST" | "ADMIN";
  createdAt: string;
  updatedAt: string;
  active: boolean;
  verified: boolean;
}

// Product типы
export interface ProductDTO {
  id: number;
  name: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  categoryId: number;
  categoryName?: string;
  brandId: number;
  brandName?: string;
  brand?: BrandDTO;
  regularPrice: number;
  price?: number;
  oldPrice?: number;
  cosmetologistPrice?: number;
  salePrice?: number;
  professional: boolean;
  active: boolean;
  stockQuantity: number;
  weight?: number;
  dimensions?: string;
  ingredients?: string;
  usageInstructions?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  adminPrice?: number;
  manufacturerCode?: string;
  images: ProductImageDTO[];
  reviews: ReviewDTO[];
  averageRating?: number;
  reviewCount?: number;
  inWishlist?: boolean;
  inCart?: boolean;
  effectivePrice?: number;
  discountPercentage?: number;
  hasDiscount?: boolean;
}

export interface ProductImageDTO {
  id: number;
  productId: number;
  imagePath: string;
  altText?: string;
  sortOrder: number;
  createdAt: string;
  main: boolean;
}

// Review типы
export interface ReviewDTO {
  id: number;
  productId: number;
  userId: number;
  userFirstName?: string;
  userLastName?: string;
  rating: number;
  comment?: string;
  verifiedPurchase: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Cart типы
export interface CartDTO {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product?: ProductDTO;
}

// Order типы
export interface OrderDTO {
  id: number;
  orderNumber: string;
  userId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryMethod: "PICKUP" | "COURIER" | "POST";
  paymentMethod: "CASH" | "CARD" | "ONLINE";
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  notes?: string;
  totalAmount: number;
  discountAmount?: number;
  shippingAmount?: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDTO[];
}

export interface OrderItemDTO {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount?: number;
  product?: ProductDTO;
}

export interface OrderCreateDTO {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryMethod: "PICKUP" | "COURIER" | "POST";
  paymentMethod: "CASH" | "CARD" | "ONLINE";
  notes?: string;
  items: OrderItemCreateDTO[];
  totalAmount: number;
  discountAmount?: number;
  shippingAmount?: number;
}

export interface OrderItemCreateDTO {
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount?: number;
}

// Message/Chat типы
export interface MessageDTO {
  id: number;
  senderId: number;
  senderName: string;
  recipientId: number;
  recipientName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatDTO {
  chatId: string;
  participants: UserDTO[];
  lastMessage?: MessageDTO;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Category типы
export interface CategoryDTO {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Brand типы
export interface BrandDTO {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Material типы
export interface MaterialDTO {
  id: number;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: string;
  accessLevel: "PUBLIC" | "COSMETOLOGIST" | "ADMIN";
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Dashboard типы
export interface DashboardStatsDTO {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;
  pendingCosmetologists: number;
  recentOrders: OrderDTO[];
  topProducts: ProductDTO[];
}

export interface CosmetologistDashboardDTO {
  profile: CosmetologistProfileDTO;
  stats: {
    totalClients: number;
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
  };
  recentOrders: OrderDTO[];
  popularProducts: ProductDTO[];
}

export interface CosmetologistProfileDTO {
  id: number;
  userId: number;
  institutionName: string;
  graduationYear: number;
  specialization?: string;
  licenseNumber?: string;
  diplomaUrl?: string;
  verified: boolean;
  verifiedAt?: string;
  rating: number;
  reviewCount: number;
}

// Wishlist типы
export interface WishlistItemDTO {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product?: ProductDTO;
}
