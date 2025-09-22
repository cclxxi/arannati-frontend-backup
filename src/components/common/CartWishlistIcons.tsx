// src/components/common/CartWishlistIcons.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart, Heart, Trash2, Plus, Minus, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Dropdown, Badge, Button, Empty, Spin, App } from "antd";
import { useAuth } from "@/hooks/queries/useAuth";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { formatPrice } from "@/utils/format";
import AuthRequiredModal from "@/components/common/AuthRequiredModal";
import type { CartDTO, WishlistItemDTO } from "@/types/api";

// Компонент для отображения иконок корзины и вишлиста со счетчиками и дропдаунами
export function CartWishlistIcons() {
  const { isAuthenticated } = useAuth();
  const { message } = App.useApp();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({
    title: "Требуется авторизация",
    description: "Для выполнения этого действия необходимо войти в систему",
  });

  // Получаем методы и данные из stores
  const {
    items: cartItems,
    isLoading: cartLoading,
    fetchCart,
    updateQuantity,
    removeItem: removeCartItem,
    getTotalCount,
    getTotalPrice,
  } = useCartStore();

  const {
    items: wishlistItems,
    isLoading: wishlistLoading,
    fetchWishlist,
    removeItem: removeWishlistItem,
    getCount: getWishlistCount,
  } = useWishlistStore();

  const { addItem: addToCart } = useCartStore();

  // Загружаем данные при монтировании и авторизации
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  const cartCount = getTotalCount();
  const wishlistCount = getWishlistCount();
  const totalPrice = getTotalPrice();

  // Обработчики для корзины
  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity > 0) {
      await updateQuantity(itemId, newQuantity);
    } else {
      await removeCartItem(itemId);
    }
  };

  const handleRemoveFromCart = async (itemId: number) => {
    await removeCartItem(itemId);
    message.success("Товар удален из корзины");
  };

  // Обработчики для избранного
  const handleMoveToCart = async (item: WishlistItemDTO) => {
    try {
      await addToCart(item.productId, 1);
      await removeWishlistItem(item.productId);
      message.success(`${item.product?.name} перемещен в корзину`);
    } catch {
      message.error("Не удалось переместить товар");
    }
  };

  const handleRemoveFromWishlist = async (productId: number) => {
    await removeWishlistItem(productId);
    message.success("Товар удален из избранного");
  };

  // Обработчик клика для неавторизованных пользователей
  const handleUnauthorizedClick = (type: "cart" | "wishlist") => {
    setAuthModalConfig({
      title: "Войдите в аккаунт",
      description:
        type === "cart"
          ? "Чтобы добавлять товары в корзину, необходимо войти в систему"
          : "Чтобы добавлять товары в избранное, необходимо войти в систему",
    });
    setShowAuthModal(true);
  };

    // Компонент изображения товара с улучшенной обработкой
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ProductImage = ({ item, alt }: { item?: any; alt: string }) => {
        // Пытаемся найти изображение в разных местах структуры данных
        const rawImagePath =
            item?.product?.images?.[0]?.imagePath ||
            item?.product?.images?.[0]?.url ||
            item?.product?.image ||
            item?.product?.imageUrl ||
            item?.product?.mainImage ||
            item?.images?.[0]?.imagePath ||
            item?.images?.[0]?.url ||
            item?.image ||
            item?.imageUrl;

        // Нормализация src как и на странице товара/в карточках
        const resolveImageSrc = (src?: string | null) => {
            const placeholder = "/product-placeholder.jpg";
            if (!src || typeof src !== "string" || src.trim() === "") return placeholder;

            const trimmed = src.trim();

            // Абсолютные ссылки
            if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
                return trimmed;
            }

            // База бэка: NEXT_PUBLIC_API_URL без /api, иначе NEXT_PUBLIC_WS_URL, иначе http://localhost:8080
            const apiBase =
                (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/?$/, "") ||
                process.env.NEXT_PUBLIC_WS_URL ||
                "http://localhost:8080";

            const ensureLeadingSlash = (p: string) => (p.startsWith("/") ? p : `/${p}`);
            const uploadsBase = `${apiBase}/uploads/product-images`;

            // Публичные плейсхолдеры оставляем относительными
            if (trimmed === "/placeholder-product.png" || trimmed === "/product-placeholder.jpg") {
                return trimmed;
            }

            // Пути, в которых уже есть uploads/... или files/...
            if (trimmed.startsWith("/uploads/") || trimmed.startsWith("uploads/")) {
                return `${apiBase}${ensureLeadingSlash(trimmed)}`;
            }
            if (trimmed.startsWith("/files/") || trimmed.startsWith("files/")) {
                return `${apiBase}${ensureLeadingSlash(trimmed)}`;
            }

            // Только имя файла (uuid.jpg и т.п.) → кладем в /uploads/product-images
            if (!trimmed.includes("/")) {
                return `${uploadsBase}/${trimmed}`;
            }

            // Абсолютные пути от корня сайта считаем public
            if (trimmed.startsWith("/")) {
                return trimmed;
            }

            // Остальные относительные — также в /uploads/product-images
            return `${uploadsBase}/${trimmed}`;
        };

        const imagePath = resolveImageSrc(rawImagePath);

        return (
            <div className="relative w-full h-full">
                {imagePath ? (
                    <Image
                        src={imagePath}
                        alt={alt}
                        fill
                        className="object-cover rounded"
                        sizes="48px"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-gray-400" />
                    </div>
                )}
            </div>
        );
    };


    // Рендер содержимого дропдауна корзины
  const cartDropdownRender = () => (
    <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-96 overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Корзина ({cartCount})
        </h3>
      </div>

      <div className="overflow-y-auto max-h-64 p-3">
        {cartLoading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : cartItems.length === 0 ? (
          <Empty
            description="Корзина пуста"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div className="space-y-2">
            {cartItems.map((item: CartDTO) => (
              <div
                key={item.id}
                className="flex gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {/* Image */}
                <div className="w-12 h-12 flex-shrink-0">
                  <ProductImage item={item} alt={item.product?.name || ""} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/catalog/product/${item.product?.id || item.productId}`}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate hover:text-mint transition-colors">
                      {item.product?.name || "Товар"}
                    </p>
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatPrice(
                      item.product?.salePrice ||
                        item.product?.effectivePrice ||
                        item.product?.regularPrice ||
                        item.product?.price ||
                        0,
                    )}
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id!, item.quantity - 1)
                      }
                      className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs px-2">{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id!, item.quantity + 1)
                      }
                      className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleRemoveFromCart(item.id!)}
                      className="ml-1 text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Итого:
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatPrice(
                totalPrice > 0
                  ? totalPrice
                  : cartItems.reduce((sum, item) => {
                      const price =
                        item.product?.salePrice ||
                        item.product?.effectivePrice ||
                        item.product?.regularPrice ||
                        item.product?.price ||
                        0;
                      return sum + price * item.quantity;
                    }, 0),
              )}
            </span>
          </div>
          <Link href="/cart">
            <Button type="primary" block className="bg-mint hover:bg-mint-dark">
              Перейти в корзину
            </Button>
          </Link>
        </div>
      )}
    </div>
  );

  // Рендер содержимого дропдауна избранного
  const wishlistDropdownRender = () => (
    <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-96 overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Избранное ({wishlistCount})
        </h3>
      </div>

      <div className="overflow-y-auto max-h-64 p-3">
        {wishlistLoading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : wishlistItems.length === 0 ? (
          <Empty
            description="Нет избранных товаров"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div className="space-y-2">
            {wishlistItems.map((item: WishlistItemDTO) => (
              <div
                key={item.id}
                className="flex gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {/* Image */}
                <div className="w-12 h-12 flex-shrink-0">
                  <ProductImage item={item} alt={item.product?.name || ""} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/catalog/product/${item.product?.id || item.productId}`}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate hover:text-mint transition-colors">
                      {item.product?.name || "Товар"}
                    </p>
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatPrice(
                      item.product?.salePrice ||
                        item.product?.effectivePrice ||
                        item.product?.regularPrice ||
                        item.product?.price ||
                        0,
                    )}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="text-xs text-mint hover:text-mint-dark transition-colors flex items-center gap-1"
                    >
                      <ShoppingCart className="w-3 h-3" />В корзину
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.productId)}
                      className="text-xs text-red-500 hover:text-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {wishlistItems.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <Link href="/wishlist">
            <Button
              type="primary"
              block
              className="bg-red-500 hover:bg-red-600 border-red-500"
            >
              Все избранное
            </Button>
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Wishlist */}
        {isAuthenticated ? (
          <Dropdown
            popupRender={wishlistDropdownRender}
            trigger={["click"]}
            placement="bottomRight"
            overlayClassName="cart-wishlist-dropdown"
          >
            <button className="relative p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors">
              <Badge count={wishlistCount} size="small" offset={[-5, 5]}>
                <Heart
                  className={`w-6 h-6 ${
                    wishlistCount > 0
                      ? "text-red-500 fill-red-500"
                      : "text-forest dark:text-beige-light"
                  }`}
                />
              </Badge>
            </button>
          </Dropdown>
        ) : (
          <button
            onClick={() => handleUnauthorizedClick("wishlist")}
            className="relative p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <Heart className="w-6 h-6 text-forest dark:text-beige-light" />
          </button>
        )}

        {/* Cart */}
        {isAuthenticated ? (
          <Dropdown
            popupRender={cartDropdownRender}
            trigger={["click"]}
            placement="bottomRight"
            overlayClassName="cart-wishlist-dropdown"
          >
            <button className="relative p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors">
              <Badge count={cartCount} size="small" offset={[-5, 5]}>
                <ShoppingCart className="w-6 h-6 text-forest dark:text-beige-light" />
              </Badge>
            </button>
          </Dropdown>
        ) : (
          <button
            onClick={() => handleUnauthorizedClick("cart")}
            className="relative p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-forest dark:text-beige-light" />
          </button>
        )}
      </div>

      {/* Auth Required Modal */}
      <AuthRequiredModal
        visible={showAuthModal}
        onCloseAction={() => setShowAuthModal(false)}
        title={authModalConfig.title}
        description={authModalConfig.description}
      />
    </>
  );
}
