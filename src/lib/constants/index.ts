// API Routes
export const API_ROUTES = {
  // Auth
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    me: "/auth/me",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    registerCosmetologist: "/auth/register/cosmetologist",
    refresh: "/auth/refresh",
  },

  // Catalog
  catalog: {
    products: "/catalog/products",
    productDetails: (id: number) => `/catalog/products/${id}`,
  },

  // Cart
  cart: {
    list: "/cart",
    add: "/cart",
    update: (id: number) => `/cart/${id}`,
    remove: (id: number) => `/cart/${id}`,
    clear: "/cart",
    count: "/cart/count",
  },

  // Wishlist
  wishlist: {
    list: "/wishlist",
    add: (productId: number) => `/wishlist/${productId}`,
    remove: (productId: number) => `/wishlist/${productId}`,
    toggle: (productId: number) => `/wishlist/toggle/${productId}`,
    check: (productId: number) => `/wishlist/check/${productId}`,
  },

  // Orders
  orders: {
    list: "/orders",
    create: "/orders",
    details: (id: number) => `/orders/${id}`,
    checkout: "/orders/checkout",
    shipping: "/orders/shipping",
  },

  // Messages
  messages: {
    chats: "/messages/chats",
    chat: (chatId: string) => `/messages/chat/${chatId}`,
    send: "/messages/send",
    support: "/messages/support",
    supportReply: "/messages/support/reply",
    decline: "/messages/decline",
    markRead: (chatId: string) => `/messages/chat/${chatId}/read`,
    unreadCount: "/messages/unread-count",
  },

  // Dashboard
  dashboard: {
    main: "/dashboard",
    profile: "/dashboard/profile",
    orders: "/dashboard/orders",
    messages: "/dashboard/messages",
    markMessageRead: (id: number) => `/dashboard/messages/${id}/read`,
    sendMessage: "/dashboard/messages/send",
  },

  // Cosmetologist
  cosmetologist: {
    dashboard: "/cosmetologist/dashboard",
    catalog: "/cosmetologist/catalog",
    catalogs: "/cosmetologist/catalogs",
    downloadFull: "/cosmetologist/catalogs/download/full",
    downloadSale: "/cosmetologist/catalogs/download/sale",
    downloadBrand: (brandId: number) =>
      `/cosmetologist/catalogs/download/brand/${brandId}`,
    downloadCustom: "/cosmetologist/catalogs/download/custom",
    reviews: "/cosmetologist/reviews",
  },

  // Admin
  admin: {
    stats: "/admin/stats",
    users: "/admin/users",
    userWishlist: (userId: number) => `/admin/users/${userId}/wishlist`,
    userCart: (userId: number) => `/admin/users/${userId}/cart`,
    toggleUserActive: (id: number) => `/admin/users/${id}/toggle-active`,
    sendMessage: (id: number) => `/admin/users/${id}/send-message`,
    products: "/admin/products",
    product: (id: number) => `/admin/products/${id}`,
    updateStock: (id: number) => `/admin/products/${id}/stock`,
    updatePricing: (id: number) => `/admin/products/${id}/pricing`,
    orders: "/admin/orders",
    orderDetails: (id: number) => `/admin/orders/${id}`,
    updateOrderStatus: (id: number) => `/admin/orders/${id}/status`,
    cancelOrder: (id: number) => `/admin/orders/${id}/cancel`,
    reviews: "/admin/reviews",
    deleteReview: (id: number) => `/admin/reviews/${id}`,
    cosmetologists: "/admin/cosmetologists",
    approveCosmetologist: (id: number) => `/admin/cosmetologists/${id}/approve`,
    declineCosmetologist: (id: number) => `/admin/cosmetologists/${id}/decline`,
    materials: "/admin/materials",
    material: (id: number) => `/admin/materials/${id}`,
  },

  // Materials
  materials: {
    get: (id: number) => `/materials/${id}`,
    download: (id: number) => `/materials/download/${id}`,
  },
} as const;

// App Routes
export const APP_ROUTES = {
  home: "/",

  // Auth
  auth: {
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    registerCosmetologist: "/register/cosmetologist",
  },

  // Public
  catalog: "/catalog",
  product: (id: number) => `/product/${id}`,
  about: "/about",
  contacts: "/contacts",

  // User
  user: {
    dashboard: "/dashboard",
    profile: "/dashboard/profile",
    orders: "/dashboard/orders",
    messages: "/dashboard/messages",
    cart: "/cart",
    checkout: "/checkout",
    wishlist: "/wishlist",
  },

  // Cosmetologist
  cosmetologist: {
    dashboard: "/cosmetologist",
    catalog: "/cosmetologist/catalog",
    reviews: "/cosmetologist/reviews",
    materials: "/cosmetologist/materials",
    messages: "/cosmetologist/messages",
  },

  // Admin
  admin: {
    dashboard: "/admin",
    users: "/admin/users",
    products: "/admin/products",
    orders: "/admin/orders",
    reviews: "/admin/reviews",
    cosmetologists: "/admin/cosmetologists",
    materials: "/admin/materials",
  },
} as const;

// User Roles
export const USER_ROLES = {
  USER: "USER",
  COSMETOLOGIST: "COSMETOLOGIST",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Order Status
export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// Delivery Methods
export const DELIVERY_METHODS = {
  PICKUP: "PICKUP",
  COURIER: "COURIER",
  POST: "POST",
} as const;

export type DeliveryMethod =
  (typeof DELIVERY_METHODS)[keyof typeof DELIVERY_METHODS];

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: "CASH",
  CARD: "CARD",
  ONLINE: "ONLINE",
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

// Sort Options
export const SORT_OPTIONS = {
  NAME_ASC: { value: "name,asc", label: "По названию (А-Я)" },
  NAME_DESC: { value: "name,desc", label: "По названию (Я-А)" },
  PRICE_ASC: { value: "effectivePrice,asc", label: "По цене (возрастание)" },
  PRICE_DESC: { value: "effectivePrice,desc", label: "По цене (убывание)" },
  RATING_DESC: { value: "averageRating,desc", label: "По рейтингу" },
  NEW_FIRST: { value: "createdAt,desc", label: "Сначала новые" },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "arannati_auth_token",
  REFRESH_TOKEN: "arannati_refresh_token",
  THEME: "arannati_theme",
  CART_ID: "arannati_cart_id",
  RECENTLY_VIEWED: "arannati_recently_viewed",
} as const;

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PHONE: /^\+?[0-9]\d{1,14}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
} as const;

// Default Values
export const DEFAULTS = {
  AVATAR_URL: "/images/default-avatar.png",
  PRODUCT_IMAGE_URL: "/images/default-product.png",
  PAGE_SIZE: 12,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_RECENTLY_VIEWED: 10,
} as const;

export const BRANDS_DATA = [
  {
    id: 1,
    name: "ATACHE",
    brandId: 1,
  },
  {
    id: 2,
    name: "Image Skincare",
    brandId: 2,
  },
  {
    id: 3,
    name: "IPH",
    brandId: 3,
  },
  {
    id: 4,
    name: "LEVISSIME",
    brandId: 4,
  },
  {
    id: 5,
    name: "VAGHEGGI",
    brandId: 5,
  },
  {
    id: 6,
    name: "VEC",
    brandId: 6,
  },
  {
    id: 7,
    name: "Yon-Ka",
    brandId: 7,
  },
  {
    id: 8,
    name: "Liposomal Vitamins",
    brandId: 8,
  },
];
