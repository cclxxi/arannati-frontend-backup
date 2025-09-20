// src/lib/utils/jwt.ts
// Утилиты для работы с JWT токенами

// Типы для JWT payload
interface JWTPayload {
  sub?: string;
  userId?: string | number;
  id?: string | number;
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
    // Убираем Bearer префикс если есть
    const cleanToken = token.startsWith("Bearer ") ? token.substring(7) : token;

    const parts = cleanToken.split(".");
    if (parts.length !== 3) {
      console.error("[JWT] Invalid token format - not 3 parts");
      return null;
    }

    // Декодируем payload (вторая часть)
    const payload = parts[1];
    if (!payload) {
      console.error("[JWT] No payload in token");
      return null;
    }

    const decodedPayload = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const parsed = JSON.parse(decodedPayload) as JWTPayload;

    console.log("[JWT] Decoded payload:", parsed);
    return parsed;
  } catch (error) {
    console.error("[JWT] Error decoding JWT:", error);
    return null;
  }
}

// Функция для проверки истечения токена
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) {
      console.warn("[JWT] No expiration in token");
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const bufferTime = 30; // 30 секунд буфера

    const isExpired = payload.exp < currentTime + bufferTime;
    if (isExpired) {
      console.log("[JWT] Token expired:", {
        exp: payload.exp,
        currentTime,
        bufferTime,
        isExpired,
      });
    }
    return isExpired;
  } catch (error) {
    console.error("[JWT] Error checking expiration:", error);
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
    // Убираем Bearer префикс если есть
    const cleanToken = token.startsWith("Bearer ") ? token.substring(7) : token;

    if (isTokenExpired(cleanToken)) {
      console.log("[JWT] Token is expired, cannot extract user");
      return null;
    }

    const payload = decodeJWT(cleanToken);
    if (!payload) {
      console.error("[JWT] Failed to decode token");
      return null;
    }

    // Debug logging для анализа структуры payload
    console.log("[JWT DEBUG] Raw payload role data:", {
      "payload.role_id": payload.role_id,
      "payload.role": payload.role,
      "payload.authorities": payload.authorities,
      email: payload.email || payload.username || payload.sub,
    });

    // Извлекаем email из различных возможных полей
    const email = payload.email || payload.username || payload.sub || "";

    // Извлекаем userId из различных возможных полей
    const userId = String(payload.userId || payload.id || payload.sub || "");

    // Извлекаем роль с приоритетами:
    let role = "USER"; // Значение по умолчанию

    // Приоритет 1: role_id (основной способ для нашего backend)
    if (typeof payload.role_id === "number") {
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
          console.warn(
            `[JWT] Unknown role_id: ${payload.role_id}, defaulting to USER`,
          );
          role = "USER";
      }
      console.log("[JWT DEBUG] Extracted role from role_id:", {
        role_id: payload.role_id,
        mapped_role: role,
      });
    }
    // Приоритет 2: прямое поле role
    else if (payload.role) {
      role = String(payload.role);
      // Убираем префикс "ROLE_" если он есть от Spring Boot
      if (role.startsWith("ROLE_")) {
        const originalRole = role;
        role = role.substring(5);
        console.log("[JWT DEBUG] Removed ROLE_ prefix:", {
          original: originalRole,
          cleaned: role,
        });
      }
      console.log("[JWT DEBUG] Extracted role from payload.role:", role);
    }
    // Приоритет 3: authorities массив
    else if (
      Array.isArray(payload.authorities) &&
      payload.authorities.length > 0
    ) {
      const authority = String(payload.authorities[0]);
      // Убираем префикс "ROLE_" если он есть
      const originalAuthority = authority;
      role = authority.startsWith("ROLE_") ? authority.substring(5) : authority;
      console.log("[JWT DEBUG] Extracted role from authorities:", {
        original: originalAuthority,
        cleaned: role,
      });
    }
    // Если роли нет нигде, логируем предупреждение
    else {
      console.warn(
        "[JWT DEBUG] No role information found in token, using default USER",
      );
    }

    // Проверяем что роль валидная
    const validRoles = ["USER", "ADMIN", "COSMETOLOGIST"];
    if (!validRoles.includes(role)) {
      console.warn(`[JWT DEBUG] Invalid role "${role}", defaulting to USER`);
      role = "USER";
    }

    // Log the final extracted user for debugging
    const user = {
      userId,
      id: userId,
      email,
      role,
      firstName: payload.firstName || payload.given_name,
      lastName: payload.lastName || payload.family_name,
    };

    console.log("[JWT DEBUG] Final extracted user:", user);

    return user;
  } catch (error) {
    console.error("[JWT] Error extracting user from token:", error);
    return null;
  }
}

// Функция для проверки валидности токена
export function isValidToken(token: string): boolean {
  if (!token) return false;

  try {
    // Убираем Bearer префикс если есть
    const cleanToken = token.startsWith("Bearer ") ? token.substring(7) : token;

    const payload = decodeJWT(cleanToken);
    const valid = Boolean(payload) && !isTokenExpired(cleanToken);

    if (!valid) {
      console.log("[JWT] Token is invalid:", {
        hasPayload: Boolean(payload),
        isExpired: isTokenExpired(cleanToken),
      });
    }

    return valid;
  } catch (error) {
    console.error("[JWT] Error validating token:", error);
    return false;
  }
}

// Функция для получения чистого токена без Bearer префикса
export function getCleanToken(token: string): string {
  return token.startsWith("Bearer ") ? token.substring(7) : token;
}
