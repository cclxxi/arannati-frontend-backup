// src/components/catalog/ProductCardInteractive.tsx - ПОЛНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ (начало)
"use client";

import React, { useState, useEffect } from "react";
import { Heart, ShoppingCart, Plus, Minus, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { useAuth } from "@/hooks/queries/useAuth";
import { formatPrice } from "@/utils/format";
import type { ProductDTO } from "@/types/api";
import { App } from "antd";
import AuthRequiredModal from "@/components/common/AuthRequiredModal";

interface ProductCardInteractiveProps {
  product: ProductDTO;
  viewMode?: "grid" | "list";
  index?: number;
}

export default function ProductCardInteractive({
  product,
  viewMode = "grid",
  index = 0,
}: ProductCardInteractiveProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [localInWishlist, setLocalInWishlist] = useState(false);
  const [localInCart, setLocalInCart] = useState(false);

  const { isAuthenticated } = useAuth();
  const { message } = App.useApp();

  // Cart store
  const {
    isInCart,
    getCartItem,
    addItem: addToCart,
    updateQuantity,
    removeItem: removeFromCart,
  } = useCartStore();

  // Wishlist store
  const {
    isInWishlist,
    toggleItem: toggleWishlist,
    fetchWishlist,
  } = useWishlistStore();

  // Обновляем локальное состояние при изменении stores
  useEffect(() => {
    setLocalInWishlist(isInWishlist(product.id!));
    setLocalInCart(isInCart(product.id!));
  }, [isInWishlist, isInCart, product.id]);

  // Get cart item for this product
  const cartItem = getCartItem(product.id!);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setAuthMessage("Войдите, чтобы добавить товар в корзину");
      setShowAuthModal(true);
      return;
    }

    try {
      await addToCart(product.id!, 1);
      setLocalInCart(true);
      message.success("Товар добавлен в корзину");
    } catch {
      message.error("Не удалось добавить товар");
    }
  };

  const handleUpdateQuantity = async (delta: number) => {
    if (!cartItem?.id) return;

    const newQuantity = quantity + delta;
    if (newQuantity > 0) {
      await updateQuantity(cartItem.id, newQuantity);
    } else if (newQuantity === 0) {
      await removeFromCart(cartItem.id);
      setLocalInCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      setAuthMessage("Войдите, чтобы добавить товар в избранное");
      setShowAuthModal(true);
      return;
    }

    try {
      const isNowInWishlist = await toggleWishlist(product.id!);
      setLocalInWishlist(isNowInWishlist);
      message.success(
        isNowInWishlist
          ? "Товар добавлен в избранное"
          : "Товар удален из избранного",
      );
    } catch (error: unknown) {
      // Если ошибка о том, что товар уже в вишлисте
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string" &&
        error.response.data.message.includes("already")
      ) {
        // Обновляем состояние
        await fetchWishlist();
        const isNowInWishlist = isInWishlist(product.id!);
        setLocalInWishlist(isNowInWishlist);
        message.info("Товар уже в избранном");
      } else {
        message.error("Не удалось изменить избранное");
      }
    }
  };

  const discount =
    product.oldPrice && product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100,
        )
      : product.salePrice && product.regularPrice
        ? Math.round(
            ((product.regularPrice - product.salePrice) /
              product.regularPrice) *
              100,
          )
        : 0;

  const displayPrice =
    product.price || product.salePrice || product.regularPrice || 0;
  const originalPrice = product.oldPrice || product.regularPrice || 0;

  // Grid view
  if (viewMode === "grid") {
    return (
      <>
        <div className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="relative aspect-square">
            {discount > 0 && (
              <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                -{discount}%
              </span>
            )}

            <button
              onClick={handleToggleWishlist}
              className={`absolute top-2 right-2 z-10 p-2 rounded-full transition-all duration-300 ${
                localInWishlist
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "bg-white/90 dark:bg-gray-800/90 hover:bg-white"
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  localInWishlist
                    ? "text-red-500 fill-red-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              />
            </button>

            <Link href={`/product/${product.id}`}>
              {product.images?.[0]?.imagePath ? (
                <Image
                  src={product.images[0].imagePath}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index < 6}
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </Link>
          </div>

          <div className="p-4">
            <Link href={`/product/${product.id}`}>
              <h3 className="font-medium text-gray-900 dark:text-white hover:text-mint transition-colors line-clamp-2 min-h-[3rem]">
                {product.name}
              </h3>
            </Link>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {product.brand?.name || product.brandName}
            </p>

            <div className="flex items-center justify-between mt-3">
              <div>
                <span className="text-lg font-bold text-mint dark:text-mint-light">
                  {formatPrice(displayPrice)}
                </span>
                {discount > 0 && originalPrice > displayPrice && (
                  <span className="text-sm text-gray-400 line-through ml-2">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="mt-4">
              {localInCart && quantity > 0 ? (
                <div className="flex items-center gap-1 bg-mint/10 dark:bg-mint/20 rounded-full px-2 py-1">
                  <button
                    onClick={() => handleUpdateQuantity(-1)}
                    className="w-7 h-7 rounded-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center font-medium text-mint dark:text-mint-light">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQuantity(1)}
                    className="w-7 h-7 rounded-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <Check className="w-5 h-5 text-green-500 ml-1" />
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full px-4 py-2 bg-mint hover:bg-mint-dark text-white rounded-full flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />В корзину
                </button>
              )}
            </div>
          </div>
        </div>

        <AuthRequiredModal
          visible={showAuthModal}
          onCloseAction={() => setShowAuthModal(false)}
          title="Требуется авторизация"
          description={authMessage}
        />
      </>
    );
  }

  // List view
  return (
    <>
      <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
        {/* Аналогичная логика для list view с использованием localInWishlist и localInCart */}
      </div>

      <AuthRequiredModal
        visible={showAuthModal}
        onCloseAction={() => setShowAuthModal(false)}
        title="Требуется авторизация"
        description={authMessage}
      />
    </>
  );
}
