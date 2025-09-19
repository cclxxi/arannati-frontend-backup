// Утилиты для работы с JWT токенами

// Типы для JWT payload
interface JWTPayload {
  sub?: string;
  userId?: string;
  id?: string;
  email?: string;
  username?: string;
  role?: string;
  role_id?: number;
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
    // Извлекаем роль, учитывая что Spring Boot может добавлять префикс "ROLE_"
    let role = "USER"; // Значение по умолчанию

    // Debug logging для анализа структуры payload
    console.log('[JWT DEBUG] Raw payload role data:', {
      'payload.role_id': payload.role_id,
      'payload.role': payload.role,
      'payload.authorities': payload.authorities,
      'email': payload.email || payload.username
    });

    // Сначала пробуем извлечь роль из role_id (основной способ для нашего backend)
    if (payload.role_id) {
      switch (payload.role_id) {
        case 1:
          role = "USER";
          break;
        case 2:
          role = "COSMETOLOGIST";
          break;
        case 3:
          role = "ADMIN";
          break;
        default:
          role = "USER";
      }
      console.log('[JWT DEBUG] Extracted role from role_id:', { role_id: payload.role_id, mapped_role: role });
    }
    // Если role_id нет, пробуем payload.role
    else if (payload.role) {
      role = payload.role;
      // Убираем префикс "ROLE_" если он есть от Spring Boot
      if (role.startsWith("ROLE_")) {
        const originalRole = role;
        role = role.substring(5);
        console.log('[JWT DEBUG] Removed ROLE_ prefix:', { original: originalRole, cleaned: role });
      }
      console.log('[JWT DEBUG] Extracted role from payload.role:', role);
    }
    // Если роли нет в payload.role, проверяем authorities
    else if (payload.authorities && payload.authorities.length > 0) {
      const authority = payload.authorities[0];
      // Убираем префикс "ROLE_" если он есть
      const originalAuthority = authority;
      role = authority.startsWith("ROLE_") ? authority.substring(5) : authority;
      console.log('[JWT DEBUG] Extracted role from authorities:', { original: originalAuthority, cleaned: role });
    }

    // Log the final extracted role for debugging
    console.log('[JWT DEBUG] Final extracted role:', { email: payload.email || payload.username, role });

    return {
      userId: payload.sub || payload.userId || payload.id || "",
      id: payload.sub || payload.userId || payload.id || "",
      email: payload.email || payload.username || "",
      role: role,
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
