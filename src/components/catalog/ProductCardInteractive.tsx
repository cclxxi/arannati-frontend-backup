// src/components/catalog/ProductCardInteractive.tsx
"use client";

import React, { useState } from "react";
import { Heart, ShoppingCart, Plus, Minus, Check, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { useAuth } from "@/hooks/queries/useAuth";
import { formatPrice } from "@/utils/format";
import type { ProductDTO, CartDTO } from "@/types/api";
import toast from "react-hot-toast";
import AuthRequiredModal from "@/components/common/AuthRequiredModal";

interface ProductCardInteractiveProps {
  product: ProductDTO;
  viewMode?: "grid" | "list";
}

export default function ProductCardInteractive({
  product,
  viewMode = "grid",
}: ProductCardInteractiveProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState("");

  const { isAuthenticated } = useAuth();
  const {
    isInCart,
    getItemQuantity,
    addItem: addToCart,
    updateQuantity,
  } = useCartStore() as {
    isInCart: (productId: number) => boolean;
    getItemQuantity: (productId: number) => number;
    addItem: (productId: number, quantity?: number) => Promise<void>;
    updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  };
  const { isInWishlist, toggleItem: toggleWishlist } = useWishlistStore() as {
    isInWishlist: (productId: number) => boolean;
    toggleItem: (productId: number) => Promise<boolean>;
  };

  const inCart = isInCart(product.id!);
  const inWishlist = isInWishlist(product.id!);
  const quantity = getItemQuantity(product.id!);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setAuthModalMessage("Войдите, чтобы добавить товар в корзину");
      setShowAuthModal(true);
      return;
    }

    try {
      await addToCart(product.id!, 1);
      toast.success(`${product.name} добавлен в корзину`);
    } catch {
      toast.error("Не удалось добавить товар в корзину");
    }
  };

  const handleUpdateQuantity = async (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 0) {
      try {
        const cartItem = useCartStore
          .getState()
          .items.find((item: CartDTO) => item.productId === product.id);
        if (cartItem?.id) {
          await updateQuantity(cartItem.id, newQuantity);
        }
      } catch {
        toast.error("Не удалось изменить количество");
      }
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      setAuthModalMessage("Войдите, чтобы добавить товар в избранное");
      setShowAuthModal(true);
      return;
    }

    try {
      const wasInWishlist = await toggleWishlist(product.id!);
      toast.success(
        wasInWishlist
          ? `${product.name} добавлен в избранное`
          : `${product.name} удален из избранного`,
      );
    } catch {
      toast.error("Не удалось изменить избранное");
    }
  };

  const discount =
    product.salePrice && product.regularPrice > product.salePrice
      ? Math.round(
          ((product.regularPrice - product.salePrice) / product.regularPrice) *
            100,
        )
      : 0;

  if (viewMode === "list") {
    return (
      <>
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
        >
          {/* Изображение */}
          <div className="relative w-32 h-32 flex-shrink-0">
            {discount > 0 && (
              <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                -{discount}%
              </div>
            )}
            {product.images?.[0]?.imagePath ? (
              <Image
                src={product.images[0].imagePath}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Информация */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <Link href={`/product/${product.id}`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-mint transition-colors">
                  {product.name}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {product.brandName} • {product.categoryName}
              </p>
              {product.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-mint dark:text-mint-light">
                  {formatPrice(product.effectivePrice || product.regularPrice)}
                </span>
                {product.salePrice &&
                  product.regularPrice > product.salePrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.regularPrice)}
                    </span>
                  )}
              </div>

              <div className="flex items-center gap-2">
                {/* Кнопка избранного */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleWishlist}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    inWishlist
                      ? "bg-red-100 dark:bg-red-900/30"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      inWishlist
                        ? "text-red-500 fill-red-500"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  />
                </motion.button>

                {/* Кнопка корзины */}
                {inCart ? (
                  <div className="flex items-center gap-1 bg-mint/10 dark:bg-mint/20 rounded-full px-2 py-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleUpdateQuantity(-1)}
                      className="w-7 h-7 rounded-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                    <span className="w-8 text-center font-medium text-mint dark:text-mint-light">
                      {quantity}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleUpdateQuantity(1)}
                      className="w-7 h-7 rounded-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleAddToCart}
                    className="px-4 py-2 bg-mint hover:bg-mint-dark text-white rounded-full flex items-center gap-2 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />В корзину
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <AuthRequiredModal
          visible={showAuthModal}
          onCloseAction={() => setShowAuthModal(false)}
          title="Требуется авторизация"
          description={authModalMessage}
        />
      </>
    );
  }

  // Grid view (карточка)
  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -5 }}
        className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        {/* Изображение */}
        <Link
          href={`/product/${product.id}`}
          className="relative aspect-square block overflow-hidden"
        >
          {discount > 0 && (
            <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
              -{discount}%
            </div>
          )}

          {/* Кнопка быстрого просмотра */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-full p-3">
              <Eye className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
          </div>

          {product.images?.[0]?.imagePath ? (
            <Image
              src={product.images[0].imagePath}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </Link>

        {/* Информация */}
        <div className="p-4">
          <Link href={`/product/${product.id}`}>
            <h3 className="font-semibold text-gray-900 dark:text-white hover:text-mint transition-colors line-clamp-2 min-h-[3rem]">
              {product.name}
            </h3>
          </Link>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {product.brandName}
          </p>

          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-lg font-bold text-mint dark:text-mint-light">
                {formatPrice(product.effectivePrice || product.regularPrice)}
              </span>
              {product.salePrice &&
                product.regularPrice > product.salePrice && (
                  <span className="text-sm text-gray-400 line-through ml-2">
                    {formatPrice(product.regularPrice)}
                  </span>
                )}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex items-center gap-2 mt-4">
            {/* Кнопка избранного */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleWishlist}
              className={`p-2 rounded-full transition-all duration-300 ${
                inWishlist
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={inWishlist ? "filled" : "empty"}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      inWishlist
                        ? "text-red-500 fill-red-500"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* Кнопка корзины */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {inCart ? (
                  <motion.div
                    key="in-cart"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-1 bg-mint/10 dark:bg-mint/20 rounded-full px-2 py-1"
                  >
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleUpdateQuantity(-1)}
                      className="w-7 h-7 rounded-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                    <span className="flex-1 text-center font-medium text-mint dark:text-mint-light">
                      {quantity}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleUpdateQuantity(1)}
                      className="w-7 h-7 rounded-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                    <Check className="w-5 h-5 text-green-500 ml-1" />
                  </motion.div>
                ) : (
                  <motion.button
                    key="add-to-cart"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddToCart}
                    className="w-full px-4 py-2 bg-mint hover:bg-mint-dark text-white rounded-full flex items-center justify-center gap-2 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />В корзину
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      <AuthRequiredModal
        visible={showAuthModal}
        onCloseAction={() => setShowAuthModal(false)}
        title="Требуется авторизация"
        description={authModalMessage}
      />
    </>
  );
}
