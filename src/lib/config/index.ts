export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080",
    timeout: 30000,
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "Arannati Shop",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
    darkMode: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE === "true",
  },
  upload: {
    maxFileSize:
      parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "5", 10) * 1024 * 1024, // MB to bytes
    allowedImageTypes: (
      process.env.NEXT_PUBLIC_ALLOWED_IMAGE_TYPES ||
      "image/jpeg,image/png,image/webp,image/gif"
    ).split(","),
  },
  pagination: {
    defaultPageSize: parseInt(
      process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || "12",
      10,
    ),
    catalogPageSize: parseInt(
      process.env.NEXT_PUBLIC_CATALOG_PAGE_SIZE || "24",
      10,
    ),
  },
  seo: {
    defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "ru",
    siteDescription:
      process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
      "Интернет-магазин профессиональной косметики Arannati",
  },
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;

export type Config = typeof config;
