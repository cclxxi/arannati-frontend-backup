"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/queries/useAuth";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";

export default function StoreInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const fetchCart = useCartStore((state) => state.fetchCart);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);

  useEffect(() => {
    if (isAuthenticated) {
      // Загружаем данные корзины и вишлиста при авторизации
      fetchCart();
      fetchWishlist();
    } else {
      // Очищаем данные при выходе
      useCartStore.getState().clearCart();
      useWishlistStore.getState().clearWishlist();
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  return <>{children}</>;
}
