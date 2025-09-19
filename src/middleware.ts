import { NextRequest, NextResponse } from "next/server";
import { USER_ROLES } from "@/constants";
import { getUserFromToken } from "@/lib/utils/jwt";

// Публичные роуты, доступные всем
const publicRoutes = [
  "/",
  "/catalog",
  "/product",
  "/about",
  "/contacts",
  "/privacy",
  "/terms",
];

// Роуты авторизации
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// Защищенные роуты и требуемые роли
const protectedRoutes: Record<string, string[]> = {
  "/dashboard": [USER_ROLES.USER, USER_ROLES.COSMETOLOGIST, USER_ROLES.ADMIN],
  "/cart": [USER_ROLES.USER, USER_ROLES.COSMETOLOGIST, USER_ROLES.ADMIN],
  "/checkout": [USER_ROLES.USER, USER_ROLES.COSMETOLOGIST],
  "/wishlist": [USER_ROLES.USER, USER_ROLES.COSMETOLOGIST],
  "/cosmetologist": [USER_ROLES.COSMETOLOGIST, USER_ROLES.ADMIN],
  "/admin": [USER_ROLES.ADMIN],
};

// Функция для проверки, начинается ли путь с указанного роута
function pathStartsWith(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

// Получение токена из cookies
function getAuthToken(request: NextRequest): string | null {
  // Пробуем получить токен из разных мест
  const accessToken = request.cookies.get("accessToken")?.value;
  const authToken = request.cookies.get("auth-token")?.value;
  const token = request.cookies.get("token")?.value;

  return accessToken || authToken || token || null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = getAuthToken(request);
  const user = token ? getUserFromToken(token) : null;

  // Debug logging for admin access issues
  if (pathname.startsWith('/admin')) {
    console.log('[MIDDLEWARE DEBUG] Admin access attempt:', {
      pathname,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 50)}...` : null,
      user: user ? {
        userId: user.userId,
        role: user.role,
        email: user.email
      } : null
    });

    // Additional JWT token debugging
    if (token) {
      try {
        const { decodeJWT } = await import('@/lib/utils/jwt');
        const payload = decodeJWT(token);
        console.log('[MIDDLEWARE DEBUG] JWT payload:', JSON.stringify(payload, null, 2));
        console.log('[MIDDLEWARE DEBUG] Role analysis:', {
          'payload.role': payload?.role,
          'payload.authorities': payload?.authorities,
          'payload.auth': payload?.["auth"],
          'payload.scope': payload?.["scope"],
          'payload.roles': payload?.["roles"]
        });
      } catch (error) {
        console.error('[MIDDLEWARE DEBUG] Error decoding token:', error);
      }
    }
  }

  // Добавляем pathname в заголовки для серверных компонентов
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // Если есть пользователь, добавляем его данные в заголовки
  if (user) {
    requestHeaders.set("x-user-role", user.role);
    requestHeaders.set("x-user-id", user.userId);
  }

  // Проверяем публичные роуты
  const isPublicRoute = publicRoutes.some((route) =>
    pathStartsWith(pathname, route),
  );

  // Проверяем auth роуты
  const isAuthRoute = authRoutes.some((route) =>
    pathStartsWith(pathname, route),
  );

  // Если пользователь авторизован и пытается зайти на auth роуты
  if (user && isAuthRoute) {
    let redirectUrl = "/dashboard";

    if (user.role === USER_ROLES.ADMIN) {
      redirectUrl = "/admin";
    } else if (user.role === USER_ROLES.COSMETOLOGIST) {
      redirectUrl = "/cosmetologist";
    }

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Публичные роуты - пропускаем
  if (isPublicRoute || isAuthRoute) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Проверяем защищенные роуты
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathStartsWith(pathname, route)) {
      // Debug logging for protected route matching
      if (pathname.startsWith('/admin')) {
        console.log('[MIDDLEWARE DEBUG] Protected route match:', {
          pathname,
          matchedRoute: route,
          allowedRoles,
          hasUser: !!user,
          userRole: user?.role
        });
      }

      // Если нет токена, редирект на login
      if (!user) {
        if (pathname.startsWith('/admin')) {
          console.log('[MIDDLEWARE DEBUG] No user found, redirecting to login');
        }
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Проверяем роль
      if (!allowedRoles.includes(user.role)) {
        if (pathname.startsWith('/admin')) {
          console.log('[MIDDLEWARE DEBUG] Role check failed:', {
            userRole: user.role,
            allowedRoles,
            includes: allowedRoles.includes(user.role)
          });
        }
        return NextResponse.redirect(new URL("/403", request.url));
      }

      // Все проверки пройдены
      if (pathname.startsWith('/admin')) {
        console.log('[MIDDLEWARE DEBUG] All checks passed, allowing access');
      }
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  // API роуты
  if (pathname.startsWith("/api")) {
    const publicApiRoutes = [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/forgot-password",
      "/api/auth/reset-password",
      "/api/auth/refresh",
      "/api/catalog",
    ];

    const isPublicApi = publicApiRoutes.some((route) =>
      pathStartsWith(pathname, route),
    );

    if (!isPublicApi && !user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Необходима авторизация" },
        { status: 401 },
      );
    }

    // Для API добавляем CORS заголовки
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    return response;
  }

  // Для всех остальных роутов - если нет токена, редирект на login
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Возвращаем ответ с модифицированными заголовками
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Конфигурация middleware
export const config = {
  matcher: [
    /*
     * Применяем middleware ко всем роутам кроме:
     * - _next/static (статические файлы)
     * - _next/image (оптимизация изображений)
     * - favicon.ico (фавикон)
     * - public (публичные файлы)
     * - файлы с расширениями
     */
    "/((?!_next/static|_next/image|favicon.ico|public|.*\\.).*)",
  ],
};
