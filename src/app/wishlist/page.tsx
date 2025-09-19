"use client";

import React, { useEffect } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button, Empty, Spin } from "antd";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { useCartStore } from "@/stores/useCartStore";
import type { WishlistItemDTO } from "@/types/api";
import { withAuth } from "@/components/auth";
import { DashboardLayout } from "@/components/layouts";
import { formatPrice } from "@/utils/format";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

function WishlistPage() {
  const {
    items,
    isLoading,
    fetchWishlist,
    removeItem,
    clearWishlist,
    getCount,
  } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const wishlistCount = getCount();

  const handleAddToCart = async (productId: number, productName: string) => {
    try {
      await addToCart(productId);
      await removeItem(productId);
      toast.success(`${productName} перемещен в корзину`);
    } catch {
      toast.error("Не удалось добавить товар в корзину");
    }
  };

  const handleRemoveItem = async (productId: number, productName: string) => {
    await removeItem(productId);
    toast.success(`${productName} удален из избранного`);
  };

  const handleClearWishlist = async () => {
    if (window.confirm("Вы уверены, что хотите очистить избранное?")) {
      await clearWishlist();
      toast.success("Избранное очищено");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Actions bar */}
        {items.length > 0 && (
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Избранное
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {wishlistCount} {wishlistCount === 1 ? "товар" : "товаров"}
              </p>
            </div>
            <Button
              danger
              icon={<Trash2 className="w-4 h-4" />}
              onClick={handleClearWishlist}
            >
              Очистить все
            </Button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12">
            <Empty
              image={<Heart className="w-24 h-24 text-gray-300 mx-auto" />}
              description={
                <div className="space-y-2">
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Нет избранных товаров
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Добавляйте понравившиеся товары в избранное
                  </p>
                </div>
              }
            >
              <Link href="/catalog">
                <Button type="primary" size="large" className="mt-4">
                  Перейти в каталог
                </Button>
              </Link>
            </Empty>
          </div>
        ) : (
          <>
            {/* Сетка товаров */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {items.map((item: WishlistItemDTO) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    {/* Кнопка удаления */}
                    <button
                      onClick={() =>
                        handleRemoveItem(
                          item.productId,
                          item.product?.name || "",
                        )
                      }
                      className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>

                    {/* Изображение */}
                    <Link
                      href={`/product/${item.product?.id}`}
                      className="block aspect-[4/3] relative"
                    >
                      {item.product?.images?.[0]?.imagePath ? (
                        <Image
                          src={item.product.images[0].imagePath}
                          alt={item.product.name || ""}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Heart className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </Link>

                    {/* Информация */}
                    <div className="p-4">
                      <Link href={`/product/${item.product?.id}`}>
                        <h3 className="font-medium text-gray-900 dark:text-white hover:text-mint transition-colors line-clamp-2 min-h-[3rem]">
                          {item.product?.name}
                        </h3>
                      </Link>

                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {item.product?.brandName}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold text-mint dark:text-mint-light">
                          {formatPrice(
                            item.product?.effectivePrice ||
                              item.product?.regularPrice ||
                              0,
                          )}
                        </span>
                      </div>

                      <Button
                        type="primary"
                        block
                        size="middle"
                        icon={<ShoppingCart className="w-4 h-4" />}
                        onClick={() =>
                          handleAddToCart(
                            item.productId,
                            item.product?.name || "",
                          )
                        }
                        className="mt-3 bg-mint hover:bg-mint-dark"
                      >
                        В корзину
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default withAuth(WishlistPage);
