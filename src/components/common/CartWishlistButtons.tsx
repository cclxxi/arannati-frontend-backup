// src/components/common/CartWishlistButtons.tsx
"use client";

import React from "react";
import { ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "antd";

interface CartWishlistButtonsProps {
  className?: string;
  iconSize?: "sm" | "md";
}

// Функция для получения количества товаров в корзине
const fetchCartCount = async (): Promise<number> => {
  try {
    const response = await fetch("http://localhost:8080/api/cart/count", {
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      return data.count || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error fetching cart count:", error);
    return 0;
  }
};

// Функция для получения количества товаров в вишлисте
const fetchWishlistCount = async (): Promise<number> => {
  try {
    const response = await fetch("http://localhost:8080/api/wishlist/count", {
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      return data.count || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error fetching wishlist count:", error);
    return 0;
  }
};

export default function CartWishlistButtons({
  className = "",
  iconSize = "md",
}: CartWishlistButtonsProps) {
  // Получаем количество товаров в корзине
  const { data: cartCount = 0 } = useQuery({
    queryKey: ["cart-count"],
    queryFn: fetchCartCount,
    refetchInterval: 30000, // Обновляем каждые 30 секунд
  });

  // Получаем количество товаров в вишлисте
  const { data: wishlistCount = 0 } = useQuery({
    queryKey: ["wishlist-count"],
    queryFn: fetchWishlistCount,
    refetchInterval: 30000,
  });

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
  };

  return (
    <div className={`flex items-center space-x-2 sm:space-x-4 ${className}`}>
      {/* Wishlist */}
      <Link href="/wishlist" className="relative">
        <Badge count={wishlistCount} size="small" offset={[-5, 5]}>
          <button className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors">
            <Heart
              className={`${iconSizes[iconSize]} text-forest dark:text-beige-light`}
            />
          </button>
        </Badge>
      </Link>

      {/* Cart */}
      <Link href="/cart" className="relative">
        <Badge count={cartCount} size="small" offset={[-5, 5]}>
          <button className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors">
            <ShoppingCart
              className={`${iconSizes[iconSize]} text-forest dark:text-beige-light`}
            />
          </button>
        </Badge>
      </Link>
    </div>
  );
}
