// src/components/common/WishlistDropdown.tsx
"use client";

import React from "react";
import { Heart, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Dropdown, Badge, Button, Empty, Spin } from "antd";
import { useWishlistItems, useRemoveFromWishlist, useAddToCart } from "@/hooks";
import { useAuth } from "@/hooks/queries/useAuth";
import { formatPrice } from "@/utils/format";
import { App } from "antd";
import type { WishlistItemDTO } from "@/types/api";

export default function WishlistDropdown() {
  const { isAuthenticated } = useAuth();
  const { message } = App.useApp();
  const { data: items = [], isLoading } = useWishlistItems();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();

  // Ensure items is always an array to prevent "items.map is not a function" error
  const safeItems = Array.isArray(items) ? items : [];
  const wishlistCount = safeItems.length;

  const handleMoveToCart = async (item: WishlistItemDTO) => {
    try {
      await addToCart.mutateAsync({
        productId: item.productId,
        quantity: 1,
      });
      await removeFromWishlist.mutateAsync(item.productId);
      message.success(`${item.product?.name} перемещен в корзину`);
    } catch {
      message.error("Не удалось переместить товар");
    }
  };

  const handleRemove = (productId: number) => {
    removeFromWishlist.mutate(productId);
  };

  // Dropdown content
  const dropdownRender = () => (
    <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-96 overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Избранное ({wishlistCount})
        </h3>
      </div>

      <div className="overflow-y-auto max-h-64 p-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : safeItems.length === 0 ? (
          <Empty
            description="Нет избранных товаров"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div className="space-y-2">
            {safeItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
              >
                {/* Image */}
                <div className="w-12 h-12 flex-shrink-0">
                  {item.product?.images?.[0]?.imagePath ? (
                    <Image
                      src={item.product.images[0].imagePath}
                      alt={item.product.name || ""}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.product?.name}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-mint font-semibold">
                      {formatPrice(
                        item.product?.effectivePrice ||
                          item.product?.regularPrice ||
                          0,
                      )}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        className="text-xs px-2 py-1 bg-mint/10 hover:bg-mint/20 text-mint rounded-full transition-colors"
                      >
                        <ShoppingCart className="w-3 h-3 inline mr-1" />В
                        корзину
                      </button>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="ml-1 text-red-500 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {safeItems.length > 0 && (
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

  if (!isAuthenticated) {
    return (
      <Link href="/wishlist">
        <button className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors">
          <Heart className="w-6 h-6 text-forest dark:text-beige-light" />
        </button>
      </Link>
    );
  }

  return (
    <Dropdown
      popupRender={dropdownRender}
      trigger={["click"]}
      placement="bottomRight"
    >
      <button className="relative p-2 mt-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors">
        <Badge count={wishlistCount} size="small" offset={[-5, -5]}>
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
  );
}
