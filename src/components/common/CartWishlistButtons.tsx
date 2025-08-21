// src/components/common/CartWishlistButtons.tsx
"use client";

import React, { useState } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "antd";
import { api } from "@/lib/api/client";
import { useAuth } from "@/hooks/queries/useAuth";
import AuthRequiredModal from "./AuthRequiredModal";

interface CartWishlistButtonsProps {
  className?: string;
  iconSize?: "sm" | "md";
}

export default function CartWishlistButtons({
  className = "",
  iconSize = "md",
}: CartWishlistButtonsProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated } = useAuth();

  // Получаем количество товаров в корзине (только для авторизованных)
  const { data: cartCount = 0 } = useQuery({
    queryKey: ["cart-count"],
    queryFn: async () => {
      const response = await api.getCartCount();
      return response.data.count || 0;
    },
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 30000 : false,
  });

  // Получаем количество товаров в вишлисте (только для авторизованных)
  const { data: wishlistCount = 0 } = useQuery({
    queryKey: ["wishlist-count"],
    queryFn: async () => {
      const response = await api.getWishlistCount();
      return response.data.count || 0;
    },
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 30000 : false,
  });

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <div className={`flex items-center space-x-2 sm:space-x-4 ${className}`}>
        {/* Wishlist */}
        <Link
          href="/wishlist"
          onClick={(e) => handleClick(e)}
          className="relative"
        >
          {isAuthenticated && (
            <Badge count={wishlistCount} size="small" offset={[-5, 5]}>
              <button className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors">
                <Heart
                  className={`${iconSizes[iconSize]} text-forest dark:text-beige-light`}
                />
              </button>
            </Badge>
          )}
          {!isAuthenticated && (
            <button className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors">
              <Heart
                className={`${iconSizes[iconSize]} text-forest dark:text-beige-light`}
              />
            </button>
          )}
        </Link>

        {/* Cart */}
        <Link href="/cart" onClick={(e) => handleClick(e)} className="relative">
          {isAuthenticated && (
            <Badge count={cartCount} size="small" offset={[-5, 5]}>
              <button className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors">
                <ShoppingCart
                  className={`${iconSizes[iconSize]} text-forest dark:text-beige-light`}
                />
              </button>
            </Badge>
          )}
          {!isAuthenticated && (
            <button className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors">
              <ShoppingCart
                className={`${iconSizes[iconSize]} text-forest dark:text-beige-light`}
              />
            </button>
          )}
        </Link>
      </div>

      {/* Модальное окно авторизации */}
      <AuthRequiredModal
        visible={showAuthModal}
        onCloseAction={() => setShowAuthModal(false)}
        title="Войдите в аккаунт"
        description="Чтобы добавлять товары в корзину и избранное, необходимо войти в систему"
      />
    </>
  );
}
