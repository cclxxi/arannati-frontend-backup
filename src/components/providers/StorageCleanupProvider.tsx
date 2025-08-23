"use client";

import React, { useEffect } from "react";

// Функция для проверки и очистки поврежденных данных в localStorage
function cleanupCorruptedStorage() {
  if (typeof window === "undefined") return;

  try {
    // Проверяем cart-storage
    const cartData = localStorage.getItem("cart-storage");
    if (cartData) {
      const parsed = JSON.parse(cartData);
      if (parsed.state && !Array.isArray(parsed.state.items)) {
        console.warn("Corrupted cart storage detected, cleaning up...");
        localStorage.removeItem("cart-storage");
      }
    }

    // Проверяем wishlist-storage
    const wishlistData = localStorage.getItem("wishlist-storage");
    if (wishlistData) {
      const parsed = JSON.parse(wishlistData);
      if (parsed.state && !Array.isArray(parsed.state.items)) {
        console.warn("Corrupted wishlist storage detected, cleaning up...");
        localStorage.removeItem("wishlist-storage");
      }
    }
  } catch (error) {
    console.error("Error cleaning up storage:", error);
    // При ошибке парсинга очищаем все
    localStorage.removeItem("cart-storage");
    localStorage.removeItem("wishlist-storage");
  }
}

export default function StorageCleanupProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Очищаем поврежденные данные при загрузке приложения
    cleanupCorruptedStorage();
  }, []);

  return <>{children}</>;
}
