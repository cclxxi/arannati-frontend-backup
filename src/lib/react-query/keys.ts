// Централизованное управление ключами для React Query
export const queryKeys = {
  all: ["all"] as const,

  // Auth
  auth: {
    all: ["auth"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
  },

  // Catalog
  catalog: {
    all: ["catalog"] as const,
    products: (filters?: Record<string, unknown>) =>
      [...queryKeys.catalog.all, "products", filters] as const,
    product: (id: number) => [...queryKeys.catalog.all, "product", id] as const,
    search: (query: string) =>
      [...queryKeys.catalog.all, "search", query] as const,
    popular: () => [...queryKeys.catalog.all, "popular"] as const,
    sale: () => [...queryKeys.catalog.all, "sale"] as const,
    new: () => [...queryKeys.catalog.all, "new"] as const,
    similar: (productId: number) =>
      [...queryKeys.catalog.all, "similar", productId] as const,
  },

  // Cart
  cart: {
    all: ["cart"] as const,
    items: () => [...queryKeys.cart.all, "items"] as const,
    count: () => [...queryKeys.cart.all, "count"] as const,
    summary: () => [...queryKeys.cart.all, "summary"] as const,
  },

  // Wishlist
  wishlist: {
    all: ["wishlist"] as const,
    items: () => [...queryKeys.wishlist.all, "items"] as const,
    count: () => [...queryKeys.wishlist.all, "count"] as const,
    check: (productId: number) =>
      [...queryKeys.wishlist.all, "check", productId] as const,
  },

  // Orders
  orders: {
    all: ["orders"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.orders.all, "list", filters] as const,
    detail: (id: number) => [...queryKeys.orders.all, "detail", id] as const,
    checkout: () => [...queryKeys.orders.all, "checkout"] as const,
    shipping: (amount: number) =>
      [...queryKeys.orders.all, "shipping", amount] as const,
    stats: () => [...queryKeys.orders.all, "stats"] as const,
  },

  // Messages
  messages: {
    all: ["messages"] as const,
    chats: () => [...queryKeys.messages.all, "chats"] as const,
    chat: (chatId: string) =>
      [...queryKeys.messages.all, "chat", chatId] as const,
    unread: () => [...queryKeys.messages.all, "unread"] as const,
  },

  // Categories
  categories: {
    all: ["categories"] as const,
    list: () => [...queryKeys.categories.all, "list"] as const,
  },

  // Brands
  brands: {
    all: ["brands"] as const,
    list: () => [...queryKeys.brands.all, "list"] as const,
  },

  // Admin
  admin: {
    all: ["admin"] as const,
    stats: () => [...queryKeys.admin.all, "stats"] as const,
    users: () => [...queryKeys.admin.all, "users"] as const,
    reviews: (productId?: number) =>
      [...queryKeys.admin.all, "reviews", productId] as const,
  },

  // Cosmetologist
  cosmetologist: {
    all: ["cosmetologist"] as const,
    dashboard: () => [...queryKeys.cosmetologist.all, "dashboard"] as const,
    catalogs: () => [...queryKeys.cosmetologist.all, "catalogs"] as const,
    reviews: () => [...queryKeys.cosmetologist.all, "reviews"] as const,
  },
};
