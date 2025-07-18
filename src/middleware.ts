import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { USER_ROLES } from "@/constants";
import { STORAGE_KEYS } from "@/lib/constants";

// Типы для JWT payload
interface JWTPayload {
  sub?: string;
  userId?: string;
  id?: string;
  role?: string;
  authorities?: string[];
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

// Публичные роуты (доступны всем)
const publicRoutes = ["/", "/catalog", "/product", "/about", "/contacts"];

// Роуты только для неавторизованных
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// Защищенные роуты с требуемыми ролями
const protectedRoutes: Record<string, string[]> = {
  "/dashboard": [USER_ROLES.USER, USER_ROLES.COSMETOLOGIST, USER_ROLES.ADMIN],
  "/cart": [USER_ROLES.USER, USER_ROLES.COSMETOLOGIST, USER_ROLES.ADMIN],
  "/checkout": [USER_ROLES.USER, USER_ROLES.COSMETOLOGIST, USER_ROLES.ADMIN],
  "/orders": [USER_ROLES.USER, USER_ROLES.COSMETOLOGIST, USER_ROLES.ADMIN],
  "/wishlist": [USER_ROLES.USER, USER_ROLES.COSMETOLOGIST, USER_ROLES.ADMIN],
  "/cosmetologist": [USER_ROLES.COSMETOLOGIST],
  "/admin": [USER_ROLES.ADMIN],
};

// Функция для проверки, начинается ли путь с указанного префикса
function pathStartsWith(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`);
}

// Функция для получения токена из cookies
function getAuthToken(request: NextRequest): string | undefined {
  return request.cookies.get(STORAGE_KEYS.AUTH_TOKEN)?.value;
}

// Функция для декодирования JWT токена
function decodeJWTPayload(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    if (!payload) {
      return null;
    }

    const decodedPayload = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodedPayload) as JWTPayload;
  } catch {
    console.error("Error decoding JWT");
    return null;
  }
}

// Функция для проверки истечения токена
function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJWTPayload(token);
    if (!payload || !payload.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true;
  }
}

// Функция для извлечения пользователя из токена
function getUserFromToken(
  token: string,
): { role: string; userId: string } | null {
  try {
    if (isTokenExpired(token)) {
      return null;
    }

    const payload = decodeJWTPayload(token);
    if (!payload) {
      return null;
    }

    // Адаптируем под структуру вашего JWT payload
    return {
      role: payload.role || payload.authorities?.[0] || USER_ROLES.USER,
      userId: payload.sub || payload.userId || payload.id || "",
    };
  } catch {
    console.error("Error extracting user from token");
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = getAuthToken(request);
  const user = token ? getUserFromToken(token) : null;

  // Проверяем публичные роуты
  const isPublicRoute = publicRoutes.some((route) =>
    pathStartsWith(pathname, route),
  );

  // Проверяем auth роуты (login, register и т.д.)
  const isAuthRoute = authRoutes.some((route) =>
    pathStartsWith(pathname, route),
  );

  // Если пользователь авторизован и пытается зайти на auth роуты
  if (user && isAuthRoute) {
    // Редирект в зависимости от роли
    let redirectUrl = "/dashboard";

    if (user.role === USER_ROLES.ADMIN) {
      redirectUrl = "/admin";
    } else if (user.role === USER_ROLES.COSMETOLOGIST) {
      redirectUrl = "/cosmetologist";
    }

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Если это публичный роут, пропускаем
  if (isPublicRoute || isAuthRoute) {
    return NextResponse.next();
  }

  // Проверяем защищенные роуты
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathStartsWith(pathname, route)) {
      // Если нет токена, редирект на login
      if (!user) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Проверяем роль
      if (!allowedRoles.includes(user.role)) {
        // Если нет доступа, показываем 403
        return NextResponse.redirect(new URL("/403", request.url));
      }

      // Все проверки пройдены
      return NextResponse.next();
    }
  }

  // API роуты
  if (pathname.startsWith("/api")) {
    // Публичные API эндпоинты
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
  }

  // Для всех остальных роутов проверяем авторизацию
  if (!user && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Конфигурация для middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
