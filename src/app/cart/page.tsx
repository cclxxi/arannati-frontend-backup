// src/app/dashboard/cart/page.tsx
"use client";

import React, { useEffect } from "react";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button, Empty, InputNumber, Checkbox, Spin } from "antd";
import { useCartStore } from "@/stores/useCartStore";
import { withAuth } from "@/components/auth";
import { PageHeader } from "@/components/dashboard";
import { formatPrice } from "@/utils/format";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import type { CartDTO } from "@/types/api";

function CartPage() {
  const {
    items,
    isLoading,
    fetchCart,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalCount,
  } = useCartStore();

  const [selectedItems, setSelectedItems] = React.useState<number[]>([]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const totalCount = getTotalCount();
  const selectedPrice = items
    .filter((item: CartDTO) => selectedItems.includes(item.id!))
    .reduce(
      (sum: number, item: CartDTO) =>
        sum +
        (item.product?.effectivePrice || item.product?.regularPrice || 0) *
          item.quantity,
      0,
    );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map((item: CartDTO) => item.id!));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: number, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, itemId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const handleQuantityChange = async (itemId: number, value: number | null) => {
    if (value && value > 0) {
      await updateQuantity(itemId, value);
      toast.success("Количество обновлено");
    }
  };

  const handleRemoveItem = async (itemId: number, productName: string) => {
    await removeItem(itemId);
    setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    toast.success(`${productName} удален из корзины`);
  };

  const handleClearCart = async () => {
    if (window.confirm("Вы уверены, что хотите очистить корзину?")) {
      await clearCart();
      setSelectedItems([]);
      toast.success("Корзина очищена");
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Выберите товары для оформления");
      return;
    }
    // Переход к оформлению заказа
    window.location.href = `/checkout?items=${selectedItems.join(",")}`;
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
        title="Корзина"
        subtitle={`${totalCount} ${totalCount === 1 ? "товар" : "товаров"}`}
        actions={
          items.length > 0 && (
            <Button
              danger
              icon={<Trash2 className="w-4 h-4" />}
              onClick={handleClearCart}
            >
              Очистить корзину
            </Button>
          )
        }
      />

      {items.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12">
          <Empty
            image={<ShoppingBag className="w-24 h-24 text-gray-300 mx-auto" />}
            description={
              <div className="space-y-2">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Корзина пуста
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Добавьте товары из каталога
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Список товаров */}
          <div className="lg:col-span-2 space-y-4">
            {/* Выбрать все */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <Checkbox
                checked={selectedItems.length === items.length}
                indeterminate={
                  selectedItems.length > 0 &&
                  selectedItems.length < items.length
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                Выбрать все товары
              </Checkbox>
            </div>

            {/* Товары */}
            <AnimatePresence>
              {items.map((item: CartDTO) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4"
                >
                  <div className="flex gap-4">
                    {/* Чекбокс */}
                    <Checkbox
                      checked={selectedItems.includes(item.id!)}
                      onChange={(e) =>
                        handleSelectItem(item.id!, e.target.checked)
                      }
                    />

                    {/* Изображение */}
                    <div className="w-24 h-24 flex-shrink-0">
                      {item.product?.images?.[0]?.imagePath ? (
                        <Image
                          src={item.product.images[0].imagePath}
                          alt={item.product.name || ""}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Информация */}
                    <div className="flex-1">
                      <Link href={`/product/${item.product?.id}`}>
                        <h3 className="font-medium text-gray-900 dark:text-white hover:text-mint transition-colors">
                          {item.product?.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {item.product?.brandName} • {item.product?.categoryName}
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4">
                          {/* Количество */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.id!,
                                  item.quantity - 1,
                                )
                              }
                              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <InputNumber
                              min={1}
                              value={item.quantity}
                              onChange={(value) =>
                                handleQuantityChange(item.id!, value)
                              }
                              className="w-16 text-center"
                            />
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.id!,
                                  item.quantity + 1,
                                )
                              }
                              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Удалить */}
                          <button
                            onClick={() =>
                              handleRemoveItem(
                                item.id!,
                                item.product?.name || "",
                              )
                            }
                            className="text-red-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Цена */}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-mint dark:text-mint-light">
                            {formatPrice(
                              (item.product?.effectivePrice ||
                                item.product?.regularPrice ||
                                0) * item.quantity,
                            )}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatPrice(
                                item.product?.effectivePrice ||
                                  item.product?.regularPrice ||
                                  0,
                              )}{" "}
                              за шт.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Итоговая информация */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Итого
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Товаров ({selectedItems.length})
                  </span>
                  <span className="font-medium">
                    {formatPrice(selectedPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Скидка
                  </span>
                  <span className="font-medium text-green-600">
                    {formatPrice(0)}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">К оплате</span>
                    <span className="text-xl font-bold text-mint dark:text-mint-light">
                      {formatPrice(selectedPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                block
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="end"
                className="bg-gradient-to-r from-mint to-forest hover:from-mint-dark hover:to-forest-dark"
              >
                Оформить заказ
              </Button>

              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                Доступные способы оплаты вы сможете выбрать при оформлении
                заказа
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default withAuth(CartPage);
