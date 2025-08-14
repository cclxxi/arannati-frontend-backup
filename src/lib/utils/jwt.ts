// Утилиты для работы с JWT токенами

// Типы для JWT payload
interface JWTPayload {
  sub?: string;
  userId?: string;
  id?: string;
  email?: string;
  username?: string;
  role?: string;
  authorities?: string[];
  firstName?: string;
  given_name?: string;
  lastName?: string;
  family_name?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

// Функция для декодирования JWT токена
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Декодируем payload (вторая часть)
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
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const bufferTime = 30; // 30 секунд буфера

    return payload.exp < currentTime + bufferTime;
  } catch {
    return true;
  }
}

// Функция для получения времени до истечения токена
export function getTokenExpirationTime(token: string): number | null {
  const payload = decodeJWT(token);

  if (!payload || !payload.exp) {
    return null;
  }

  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();

  return Math.max(0, expirationTime - currentTime);
}

// Функция для извлечения пользователя из токена
export function getUserFromToken(token: string): {
  userId: string;
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
} | null {
  try {
    if (isTokenExpired(token)) {
      return null;
    }

    const payload = decodeJWT(token);
    if (!payload) {
      return null;
    }

    // Адаптируем под структуру вашего JWT payload от Spring Boot
    return {
      userId: payload.sub || payload.userId || payload.id || "",
      id: payload.sub || payload.userId || payload.id || "",
      email: payload.email || payload.username || "",
      role: payload.role || payload.authorities?.[0] || "USER",
      firstName: payload.firstName || payload.given_name,
      lastName: payload.lastName || payload.family_name,
    };
  } catch {
    console.error("Error extracting user from token");
    return null;
  }
}

// Функция для проверки валидности токена
export function isValidToken(token: string): boolean {
  if (!token) return false;

  try {
    const payload = decodeJWT(token);
    return <boolean>(<unknown>payload) && !isTokenExpired(token);
  } catch {
    return false;
  }
}
