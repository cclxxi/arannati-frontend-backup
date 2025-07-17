// Утилиты для работы с JWT токенами

interface JWTPayload {
  sub: string; // user id
  email: string;
  role: string;
  exp: number; // expiration time
  iat: number; // issued at
}

// Декодирование JWT токена (без проверки подписи)
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT состоит из трех частей: header.payload.signature
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    // Декодируем payload (вторая часть)
    const payload = parts[1];

    // Проверяем, что payload существует
    if (!payload) {
      return null;
    }

    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));

    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    console.error("Ошибка декодирования JWT:", error);
    return null;
  }
}

// Проверка истечения токена
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);

  if (!payload || !payload.exp) {
    return true;
  }

  // exp в JWT хранится в секундах, а Date.now() возвращает миллисекунды
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();

  // Добавляем небольшой буфер в 30 секунд
  return currentTime >= expirationTime - 30000;
}

// Получение времени до истечения токена
export function getTokenExpirationTime(token: string): number | null {
  const payload = decodeJWT(token);

  if (!payload || !payload.exp) {
    return null;
  }

  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();

  return Math.max(0, expirationTime - currentTime);
}

// Получение данных пользователя из токена
export function getUserFromToken(
  token: string,
): { id: string; email: string; role: string } | null {
  const payload = decodeJWT(token);

  if (!payload) {
    return null;
  }

  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}
