// src/components/common/CartDropdown.tsx
"use client";

import React from "react";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Dropdown, Badge, Button, Empty, Spin } from "antd";
import { useCartItems, useUpdateCartItem, useRemoveFromCart } from "@/hooks";
import { useAuth } from "@/hooks/queries/useAuth";
import { formatPrice } from "@/utils/format";

export default function CartDropdown() {
  const { isAuthenticated } = useAuth();
  const { data: items = [], isLoading } = useCartItems();
  const updateQuantity = useUpdateCartItem();
  const removeItem = useRemoveFromCart();

  // Ensure items is always an array before using reduce
  const safeItems = Array.isArray(items) ? items : [];
  const totalCount = safeItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = safeItems.reduce((sum, item) => {
    const price =
      item.product?.effectivePrice || item.product?.regularPrice || 0;
    return sum + price * item.quantity;
  }, 0);

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity.mutate({ id: itemId, quantity: newQuantity });
    }
  };

  const handleRemove = (itemId: number) => {
    removeItem.mutate(itemId);
  };

  // Dropdown content
  const dropdownRender = () => (
    <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-96 overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Корзина ({totalCount})
        </h3>
      </div>

      <div className="overflow-y-auto max-h-64 p-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : safeItems.length === 0 ? (
          <Empty
            description="Корзина пуста"
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
                        onClick={() =>
                          handleQuantityChange(item.id!, item.quantity - 1)
                        }
                        className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id!, item.quantity + 1)
                        }
                        className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemove(item.id!)}
                        className="ml-1 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
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
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Итого:
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatPrice(totalPrice)}
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

  if (!isAuthenticated) {
    return (
      <Link href="/cart">
        <button className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors">
          <ShoppingCart className="w-6 h-6 text-forest dark:text-beige-light" />
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
        <Badge count={totalCount} size="small" offset={[-5, -5]}>
          <ShoppingCart className="w-6 h-6 text-forest dark:text-beige-light" />
        </Badge>
      </button>
    </Dropdown>
  );
}
