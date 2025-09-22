// src/components/home/FeaturedProducts.tsx
"use client";

import React, { useState, useCallback } from "react";
import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, auth } from "@/lib/api/client";
import { App } from "antd";
import AuthRequiredModal from "@/components/common/AuthRequiredModal";
import type { ProductDTO } from "@/types/api";

// Helper function to format image URLs - moved inside component for memoization

// Define possible response types
interface ProductsResponse {
  products?: ProductDTO[];
  content?: ProductDTO[];
  data?: {
    products?: ProductDTO[];
  };
}

export default function FeaturedProducts() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({
    title: "Требуется авторизация",
    description: "Для выполнения этого действия необходимо войти в систему",
  });
  const queryClient = useQueryClient();
  const isAuthenticated = auth.isAuthenticated();
  const { message } = App.useApp();

  // Загружаем популярные товары
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const response = await api.getProducts({
        size: "8",
        sort: "sortOrder,asc", // Используем sortOrder вместо rating
      });

      // Обрабатываем разные форматы ответа
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        const responseData = response.data as unknown as ProductsResponse;
        if (
          responseData.data?.products &&
          Array.isArray(responseData.data.products)
        ) {
          // Формат из логов: {data: {products: [...]}}
          return responseData.data.products;
        } else if (
          responseData.products &&
          Array.isArray(responseData.products)
        ) {
          return responseData.products;
        } else if (
          responseData.content &&
          Array.isArray(responseData.content)
        ) {
          return responseData.content;
        }
      }
      return [];
    },
  });

  // Мутация для добавления в корзину
  const addToCartMutation = useMutation({
    mutationFn: (productId: number) => api.addToCart(productId, 1),
    onSuccess: () => {
      message.success("Товар добавлен в корзину");
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
    },
    onError: () => {
      message.error("Не удалось добавить товар в корзину");
    },
  });

  // Мутация для добавления в избранное
  const toggleWishlistMutation = useMutation({
    mutationFn: (productId: number) => api.toggleWishlist(productId),
    onSuccess: () => {
      message.success("Товар добавлен в избранное");
      queryClient.invalidateQueries({ queryKey: ["wishlist-count"] });
    },
    onError: () => {
      message.error("Не удалось добавить товар в избранное");
    },
  });

  const handleAddToCart = useCallback((product: ProductDTO) => {
    if (!isAuthenticated) {
      setAuthModalConfig({
        title: "Войдите, чтобы добавить в корзину",
        description: `Для добавления товара "${product.name}" в корзину необходимо войти в систему`,
      });
      setShowAuthModal(true);
      return;
    }
    addToCartMutation.mutate(product.id!);
  }, [isAuthenticated, addToCartMutation]);

  const handleToggleWishlist = useCallback((product: ProductDTO) => {
    if (!isAuthenticated) {
      setAuthModalConfig({
        title: "Войдите, чтобы добавить в избранное",
        description: `Для добавления товара "${product.name}" в избранное необходимо войти в систему`,
      });
      setShowAuthModal(true);
      return;
    }
    toggleWishlistMutation.mutate(product.id!);
  }, [isAuthenticated, toggleWishlistMutation]);

  const formatPrice = useCallback((price: number | string) => {
    const numPrice = Number(price);
    // Handle NaN, null, undefined, and negative values
    if (isNaN(numPrice) || numPrice == null || numPrice < 0) {
      return "0 ₸";
    }

    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "KZT",
      minimumFractionDigits: 0,
    }).format(numPrice);
  }, []);

  const calculateDiscount = useCallback((regularPrice: number | string, salePrice: number | string) => {
    const regular = Number(regularPrice);
    const sale = Number(salePrice);
    if (isNaN(regular) || isNaN(sale) || regular <= 0) {
      return 0;
    }
    return Math.round(((regular - sale) / regular) * 100);
  }, []);

  const formatImageUrl = useCallback((imagePath: string): string => {
    // If already a complete URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If already starts with slash, return as is
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    
    // For relative paths, construct the full URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    // Remove /api from base URL if present and add /uploads prefix
    const imageBaseUrl = baseUrl.replace('/api', '') + '/uploads/product-images/';
    return imageBaseUrl + imagePath;
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-forest dark:text-beige-light mb-8">
            Популярные товары
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-forest/30 rounded-2xl p-4 animate-pulse"
              >
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-forest dark:text-beige-light">
              Популярные товары
            </h2>
            <Link
              href="/catalog"
              className="text-mint hover:text-forest dark:hover:text-beige-light transition-colors flex items-center gap-1"
            >
              Все товары
              <span>→</span>
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Товары не найдены
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map((product: ProductDTO) => (
                <div
                  key={`featured-${product.id}`}
                  className="group bg-white dark:bg-forest/30 backdrop-blur-sm rounded-2xl p-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-xl">
                    {product.images &&
                    product.images.length > 0 &&
                    product.images[0]?.imagePath ? (
                      <Image
                        src={formatImageUrl(product.images[0].imagePath) || "/images/product-placeholder.jpg"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-mint/20 to-forest/20 flex items-center justify-center">
                        <span className="text-6xl">🧴</span>
                      </div>
                    )}

                    {/* Badges */}
                    {product.salePrice && product.regularPrice && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        -{calculateDiscount(product.regularPrice, product.salePrice)}%
                      </span>
                    )}

                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-5 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleToggleWishlist(product)}
                        className="w-8 h-8 bg-white/90 dark:bg-gray/90 rounded-full flex items-center justify-center hover:bg-mint text-forest dark:text-forest hover:text-white transition-colors shadow-md"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/product/${product.id}`}
                        className="w-8 h-8 bg-white/90 dark:bg-gray/90 rounded-full flex items-center justify-center hover:bg-mint text-forest dark:text-forest hover:text-white transition-colors shadow-md"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-forest dark:text-beige-light line-clamp-2 min-h-[48px]">
                      {product.name}
                    </h3>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {product.brandName}
                    </p>

                    {/* Rating */}
                    {product.averageRating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {product.averageRating.toFixed(1)}
                        </span>
                        {product.reviewCount && (
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            ({product.reviewCount})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div>
                        {product.salePrice ? (
                          <>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">
                              {formatPrice(product.salePrice)}
                            </p>
                            <p className="text-sm text-gray-500 line-through">
                              {formatPrice(product.regularPrice)}
                            </p>
                          </>
                        ) : (
                          <p className="text-lg font-bold text-forest dark:text-beige-light">
                            {formatPrice(product.regularPrice)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-10 h-10 bg-gradient-to-r from-mint to-forest rounded-full flex items-center justify-center text-white hover:shadow-lg transition-all duration-300 transform hover:scale-110"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal for auth required */}
      <AuthRequiredModal
        visible={showAuthModal}
        onCloseAction={() => setShowAuthModal(false)}
        title={authModalConfig.title}
        description={authModalConfig.description}
      />
    </>
  );
}
