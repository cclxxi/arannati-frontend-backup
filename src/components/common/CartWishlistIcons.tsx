"use client";

import React, { useEffect } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";
import { Badge } from "antd";
import { useAuth } from "@/hooks/queries/useAuth";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";

// Компонент для отображения иконок корзины и вишлиста со счетчиками
export function CartWishlistIcons() {
  const { isAuthenticated } = useAuth();

  // Получаем методы и данные из stores
  const cartCount = useCartStore((state) => state.getTotalCount());
  const wishlistCount = useWishlistStore((state) => state.getCount());
  const fetchCart = useCartStore((state) => state.fetchCart);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);

  // Загружаем данные при монтировании и авторизации
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      {/* Wishlist */}
      <Link
        href={isAuthenticated ? "/wishlist" : "/login"}
        className="relative p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors"
      >
        {isAuthenticated && wishlistCount > 0 ? (
          <Badge count={wishlistCount} size="small" offset={[-5, 5]}>
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          </Badge>
        ) : (
          <Heart className="w-6 h-6 text-forest dark:text-beige-light" />
        )}
      </Link>

      {/* Cart */}
      <Link
        href={isAuthenticated ? "/cart" : "/login"}
        className="relative p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors"
      >
        {isAuthenticated && cartCount > 0 ? (
          <Badge count={cartCount} size="small" offset={[-5, 5]}>
            <ShoppingCart className="w-6 h-6 text-forest dark:text-beige-light" />
          </Badge>
        ) : (
          <ShoppingCart className="w-6 h-6 text-forest dark:text-beige-light" />
        )}
      </Link>
    </div>
  );
}
