declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // API Configuration
            NEXT_PUBLIC_API_URL: string;
            NEXT_PUBLIC_WS_URL: string;

            // App Configuration
            NEXT_PUBLIC_APP_NAME: string;
            NEXT_PUBLIC_APP_URL: string;

            // Feature flags
            NEXT_PUBLIC_ENABLE_ANALYTICS: string;
            NEXT_PUBLIC_ENABLE_DARK_MODE: string;

            // File upload
            NEXT_PUBLIC_MAX_FILE_SIZE: string;
            NEXT_PUBLIC_ALLOWED_IMAGE_TYPES: string;

            // Pagination
            NEXT_PUBLIC_DEFAULT_PAGE_SIZE: string;
            NEXT_PUBLIC_CATALOG_PAGE_SIZE: string;

            // SEO
            NEXT_PUBLIC_DEFAULT_LOCALE: string;
            NEXT_PUBLIC_SITE_DESCRIPTION: string;

            // Environment
            NODE_ENV: 'development' | 'production' | 'test';
        }
    }
}

export {};
