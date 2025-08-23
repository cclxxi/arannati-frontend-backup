"use client";

import React, { useEffect } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button, Empty, Spin, Checkbox } from "antd";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { useCartStore } from "@/stores/useCartStore";
import type { WishlistItemDTO } from "@/types/api";
import { withAuth } from "@/components/auth";
import { PageHeader } from "@/components/dashboard";
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

  const [selectedItems, setSelectedItems] = React.useState<number[]>([]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const wishlistCount = getCount();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map((item: WishlistItemDTO) => item.productId));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (productId: number, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, productId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleAddToCart = async (productId: number, productName: string) => {
    try {
      await addToCart(productId);
      await removeItem(productId);
      toast.success(`${productName} перемещен в корзину`);
    } catch {
      toast.error("Не удалось добавить товар в корзину");
    }
  };

  const handleAddSelectedToCart = async () => {
    if (selectedItems.length === 0) {
      toast.error("Выберите товары для добавления");
      return;
    }

    try {
      for (const productId of selectedItems) {
        await addToCart(productId);
        await removeItem(productId);
      }
      setSelectedItems([]);
      toast.success(`${selectedItems.length} товаров добавлено в корзину`);
    } catch {
      toast.error("Не удалось добавить товары в корзину");
    }
  };

  const handleRemoveItem = async (productId: number, productName: string) => {
    await removeItem(productId);
    setSelectedItems((prev) => prev.filter((id) => id !== productId));
    toast.success(`${productName} удален из избранного`);
  };

  const handleClearWishlist = async () => {
    if (window.confirm("Вы уверены, что хотите очистить избранное?")) {
      await clearWishlist();
      setSelectedItems([]);
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
    <>
      <PageHeader
        title="Избранное"
        subtitle={`${wishlistCount} ${wishlistCount === 1 ? "товар" : "товаров"}`}
        actions={
          items.length > 0 && (
            <div className="flex gap-2">
              <Button
                type="primary"
                icon={<ShoppingCart className="w-4 h-4" />}
                onClick={handleAddSelectedToCart}
                disabled={selectedItems.length === 0}
              >
                В корзину ({selectedItems.length})
              </Button>
              <Button
                danger
                icon={<Trash2 className="w-4 h-4" />}
                onClick={handleClearWishlist}
              >
                Очистить
              </Button>
            </div>
          )
        }
      />

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
          {/* Выбрать все */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
            <Checkbox
              checked={selectedItems.length === items.length}
              indeterminate={
                selectedItems.length > 0 && selectedItems.length < items.length
              }
              onChange={(e) => handleSelectAll(e.target.checked)}
            >
              Выбрать все товары
            </Checkbox>
          </div>

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
                  {/* Чекбокс */}
                  <div className="absolute top-3 left-3 z-10">
                    <Checkbox
                      checked={selectedItems.includes(item.productId)}
                      onChange={(e) =>
                        handleSelectItem(item.productId, e.target.checked)
                      }
                      className="bg-white/90 dark:bg-gray-800/90 rounded-lg p-1"
                    />
                  </div>

                  {/* Кнопка удаления */}
                  <button
                    onClick={() =>
                      handleRemoveItem(item.productId, item.product?.name || "")
                    }
                    className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>

                  {/* Изображение */}
                  <Link
                    href={`/product/${item.product?.id}`}
                    className="block aspect-square relative"
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
    </>
  );
}

export default withAuth(WishlistPage);
