// src/app/product/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Heart,
  ShoppingCart,
  Plus,
  Minus,
  ArrowLeft,
  Share2,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button, Rate, Tabs, Spin, message, Breadcrumb } from "antd";

import { catalogApi } from "@/lib/api/services/catalog";
import { useAuth } from "@/hooks/queries/useAuth";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { formatPrice } from "@/utils/format";
import type { ProductDTO, ProductImageDTO, ReviewDTO } from "@/types/api";
import Header from "@/components/common/Header";
import ProductCardInteractive from "@/components/catalog/ProductCardInteractive";
import AuthRequiredModal from "@/components/common/AuthRequiredModal";

// Компонент для галереи изображений товара
const ProductImageGallery = ({
  images,
  productName,
}: {
  images: ProductImageDTO[];
  productName: string;
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const currentImage = images?.[selectedImageIndex] || {
    imagePath: "/placeholder-product.png",
    altText: productName,
  };

  return (
    <div className="space-y-4">
      {/* Основное изображение */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
        <Image
          src={currentImage.imagePath || "/placeholder-product.png"}
          alt={currentImage.altText || productName}
          fill
          className={`object-cover ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      </div>

      {/* Миниатюры */}
      {images && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedImageIndex
                  ? "border-mint"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
              }`}
            >
              <Image
                src={image.imagePath || "/placeholder-product.png"}
                alt={image.altText || `${productName} ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Компонент для отображения отзывов
const ProductReviews = ({
  reviews,
  averageRating,
}: {
  reviews: ReviewDTO[];
  averageRating?: number;
}) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Пока нет отзывов о товаре
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Общий рейтинг */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="text-3xl font-bold">
          {averageRating?.toFixed(1) || "0.0"}
        </div>
        <div>
          <Rate
            disabled
            value={averageRating}
            allowHalf
            className="text-yellow-400"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            На основе {reviews.length} отзыв
            {reviews.length % 10 === 1 && reviews.length % 100 !== 11
              ? "а"
              : "ов"}
          </p>
        </div>
      </div>

      {/* Список отзывов */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-gray-100 dark:border-gray-800 pb-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {review.userFirstName} {review.userLastName}
                </span>
                {review.verifiedPurchase && (
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                    Проверенная покупка
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(review.createdAt).toLocaleDateString("ru-RU")}
              </span>
            </div>
            <Rate
              disabled
              value={review.rating}
              className="text-yellow-400 mb-2"
            />
            {review.comment && (
              <p className="text-gray-700 dark:text-gray-300">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ProductPage() {
  const params = useParams();
  const productId = parseInt(params["id"] as string);

  const [quantity, setQuantity] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  const { isAuthenticated } = useAuth();
  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();

  // Получение данных товара
  const {
    data: product,
    isLoading,
    error,
  } = useQuery<ProductDTO>({
    queryKey: ["product", productId],
    queryFn: () => catalogApi.getProductDetails(productId),
    enabled: !isNaN(productId),
  });

  // Получение похожих товаров
  const { data: similarProducts = [] } = useQuery<ProductDTO[]>({
    queryKey: ["similarProducts", productId],
    queryFn: () => catalogApi.getSimilarProducts(productId, 4),
    enabled: !isNaN(productId),
  });

  // Инициализация stores при авторизации
  useEffect(() => {
    if (isAuthenticated) {
      cartStore.fetchCart();
      wishlistStore.fetchWishlist();
    }
  }, [isAuthenticated, cartStore, wishlistStore]);

  // Проверка состояния товара в корзине и wishlist
  const isInCart = cartStore.isInCart(productId);
  const isInWishlist = wishlistStore.isInWishlist(productId);
  const cartItem = cartStore.getCartItem(productId);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setAuthMessage("Войдите, чтобы добавить товар в корзину");
      setShowAuthModal(true);
      return;
    }

    if (!product) return;

    try {
      await cartStore.addItem(product.id, quantity);
      message.success("Товар добавлен в корзину");
    } catch {
      message.error("Не удалось добавить товар в корзину");
    }
  };

  const handleUpdateCartQuantity = async (delta: number) => {
    if (!cartItem?.id) return;

    const newQuantity = (cartItem.quantity || 0) + delta;
    if (newQuantity > 0) {
      await cartStore.updateQuantity(cartItem.id, newQuantity);
    } else if (newQuantity === 0) {
      await cartStore.removeItem(cartItem.id);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      setAuthMessage("Войдите, чтобы добавить товар в избранное");
      setShowAuthModal(true);
      return;
    }

    if (!product) return;

    try {
      const isNowInWishlist = await wishlistStore.toggleItem(product.id);
      message.success(
        isNowInWishlist
          ? "Товар добавлен в избранное"
          : "Товар удален из избранного",
      );
    } catch {
      message.error("Не удалось изменить избранное");
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-96">
              <Spin size="large" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Товар не найден</h1>
              <Link href="/catalog">
                <Button type="primary">Вернуться в каталог</Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

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

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Хлебные крошки */}
          <Breadcrumb
            className="mb-6"
            items={[
              {
                title: <Link href="/">Главная</Link>,
              },
              {
                title: <Link href="/catalog">Каталог</Link>,
              },
              {
                title: product.name,
              },
            ]}
          />

          {/* Кнопка назад */}
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-mint transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к каталогу
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-8 p-8">
              {/* Левая колонка - изображения */}
              <div>
                <ProductImageGallery
                  images={product.images}
                  productName={product.name}
                />
              </div>

              {/* Правая колонка - информация о товаре */}
              <div className="space-y-6">
                {/* Заголовок и бренд */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {product.name}
                  </h1>
                  {(product.brand?.name || product.brandName) && (
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      Бренд: {product.brand?.name || product.brandName}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Артикул: {product.sku}
                  </p>
                </div>

                {/* Рейтинг */}
                {product.averageRating && (
                  <div className="flex items-center gap-2">
                    <Rate
                      disabled
                      value={product.averageRating}
                      allowHalf
                      className="text-yellow-400"
                    />
                    <span className="text-gray-600 dark:text-gray-400">
                      ({product.reviewCount || 0} отзыв
                      {(product.reviewCount || 0) % 10 === 1 ? "" : "ов"})
                    </span>
                  </div>
                )}

                {/* Цена */}
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-mint dark:text-mint-light">
                      {formatPrice(displayPrice)}
                    </span>
                    {discount > 0 && originalPrice > displayPrice && (
                      <>
                        <span className="text-xl text-gray-400 line-through">
                          {formatPrice(originalPrice)}
                        </span>
                        <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                          -{discount}%
                        </span>
                      </>
                    )}
                  </div>
                  {product.professional && (
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      ⚠️ Профессиональный продукт
                    </p>
                  )}
                </div>

                {/* Краткое описание */}
                {product.shortDescription && (
                  <p className="text-gray-700 dark:text-gray-300">
                    {product.shortDescription}
                  </p>
                )}

                {/* Наличие */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${product.stockQuantity > 0 ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <span className="text-sm">
                    {product.stockQuantity > 0
                      ? `В наличии (${product.stockQuantity} шт.)`
                      : "Нет в наличии"}
                  </span>
                </div>

                {/* Управление количеством и добавление в корзину */}
                {product.stockQuantity > 0 && (
                  <div className="space-y-4">
                    {!isInCart ? (
                      <>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium">
                            Количество:
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setQuantity(Math.max(1, quantity - 1))
                              }
                              className="w-8 h-8 rounded-full border border-gray-300 hover:border-mint flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-medium">
                              {quantity}
                            </span>
                            <button
                              onClick={() =>
                                setQuantity(
                                  Math.min(product.stockQuantity, quantity + 1),
                                )
                              }
                              className="w-8 h-8 rounded-full border border-gray-300 hover:border-mint flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={handleAddToCart}
                          className="w-full px-6 py-3 bg-mint hover:bg-mint-dark text-white rounded-full flex items-center justify-center gap-2 transition-colors font-medium"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Добавить в корзину
                        </button>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-mint/10 dark:bg-mint/20 rounded-full px-4 py-2">
                          <span className="text-sm font-medium">
                            В корзине:
                          </span>
                          <button
                            onClick={() => handleUpdateCartQuantity(-1)}
                            className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-medium text-mint dark:text-mint-light">
                            {cartItem?.quantity || 0}
                          </span>
                          <button
                            onClick={() => handleUpdateCartQuantity(1)}
                            className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Кнопки действий */}
                <div className="flex gap-4">
                  <button
                    onClick={handleToggleWishlist}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all ${
                      isInWishlist
                        ? "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-500"
                        : "border-gray-300 dark:border-gray-600 hover:border-mint"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${isInWishlist ? "fill-red-500" : ""}`}
                    />
                    {isInWishlist ? "В избранном" : "В избранное"}
                  </button>

                  <button className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-mint transition-colors">
                    <Share2 className="w-5 h-5" />
                    Поделиться
                  </button>
                </div>

                {/* Преимущества */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Truck className="w-4 h-4" />
                    Быстрая доставка
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Shield className="w-4 h-4" />
                    Гарантия качества
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <RotateCcw className="w-4 h-4" />
                    Возврат 14 дней
                  </div>
                </div>
              </div>
            </div>

            {/* Табы с детальной информацией */}
            <div className="px-8 pb-8">
              <Tabs
                defaultActiveKey="description"
                size="large"
                items={[
                  {
                    key: "description",
                    label: "Описание",
                    children: (
                      <div className="prose prose-gray dark:prose-invert max-w-none">
                        {product.description ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: product.description,
                            }}
                          />
                        ) : (
                          <p>Описание товара будет добавлено позже.</p>
                        )}
                      </div>
                    ),
                  },
                  ...(product.ingredients
                    ? [
                        {
                          key: "ingredients",
                          label: "Состав",
                          children: (
                            <div className="prose prose-gray dark:prose-invert max-w-none">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: product.ingredients,
                                }}
                              />
                            </div>
                          ),
                        },
                      ]
                    : []),
                  ...(product.usageInstructions
                    ? [
                        {
                          key: "usage",
                          label: "Применение",
                          children: (
                            <div className="prose prose-gray dark:prose-invert max-w-none">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: product.usageInstructions,
                                }}
                              />
                            </div>
                          ),
                        },
                      ]
                    : []),
                  {
                    key: "reviews",
                    label: `Отзывы (${product.reviewCount || 0})`,
                    children: (
                      <ProductReviews
                        reviews={product.reviews}
                        averageRating={product.averageRating}
                      />
                    ),
                  },
                  {
                    key: "specs",
                    label: "Характеристики",
                    children: (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <dt className="font-medium">Артикул</dt>
                            <dd className="text-gray-600 dark:text-gray-400">
                              {product.sku}
                            </dd>
                          </div>
                          {product.weight && (
                            <div className="space-y-2">
                              <dt className="font-medium">Вес</dt>
                              <dd className="text-gray-600 dark:text-gray-400">
                                {product.weight} г
                              </dd>
                            </div>
                          )}
                          {product.dimensions && (
                            <div className="space-y-2">
                              <dt className="font-medium">Размеры</dt>
                              <dd className="text-gray-600 dark:text-gray-400">
                                {product.dimensions}
                              </dd>
                            </div>
                          )}
                          {product.manufacturerCode && (
                            <div className="space-y-2">
                              <dt className="font-medium">Код производителя</dt>
                              <dd className="text-gray-600 dark:text-gray-400">
                                {product.manufacturerCode}
                              </dd>
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>

          {/* Похожие товары */}
          {similarProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Похожие товары
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProducts.map((similarProduct) => (
                  <ProductCardInteractive
                    key={similarProduct.id}
                    product={similarProduct}
                    viewMode="grid"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Модальное окно авторизации */}
        <AuthRequiredModal
          visible={showAuthModal}
          onCloseAction={() => setShowAuthModal(false)}
          title="Требуется авторизация"
          description={authMessage}
        />
      </div>
    </>
  );
}
