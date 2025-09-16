// src/components/common/CartWishlistButtons.tsx
"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/queries/useAuth";
import AuthRequiredModal from "./AuthRequiredModal";
import CartDropdown from "../cart-and-wishlist/CartDropdown";
import WishlistDropdown from "../cart-and-wishlist/WishlistDropdown";

interface CartWishlistButtonsProps {
  className?: string;
  iconSize?: "sm" | "md";
}

export default function CartWishlistButtons({
  className = "",
}: CartWishlistButtonsProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated } = useAuth();

  // Если не авторизован, показываем модалку при клике
  if (!isAuthenticated) {
    return (
      <>
        <div
          className={`flex items-center space-x-2 sm:space-x-4 ${className}`}
        >
          <button
            onClick={() => setShowAuthModal(true)}
            className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6 text-forest dark:text-beige-light"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          <button
            onClick={() => setShowAuthModal(true)}
            className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6 text-forest dark:text-beige-light"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </button>
        </div>

        <AuthRequiredModal
          visible={showAuthModal}
          onCloseAction={() => setShowAuthModal(false)}
          title="Войдите в аккаунт"
          description="Чтобы добавлять товары в корзину и избранное, необходимо войти в систему"
        />
      </>
    );
  }

  // Для авторизованных пользователей показываем выпадающие меню
  return (
    <div className={`flex items-center space-x-2 sm:space-x-4 ${className}`}>
      <WishlistDropdown />
      <CartDropdown />
    </div>
  );
}
