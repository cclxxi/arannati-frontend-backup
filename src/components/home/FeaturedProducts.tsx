"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Eye, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "antd";
import axios from "axios";
import { formatPrice } from "@/utils/format";

interface Product {
    id: number;
    name: string;
    brand: string;
    price: number;
    discountPrice?: number;
    image: string;
    rating: number;
    reviewsCount: number;
    isNew?: boolean;
    isBestseller?: boolean;
}

// Функция для получения избранных товаров
const fetchFeaturedProducts = async (): Promise<Product[]> => {
    try {
        const response = await axios.get("/api/products/featured", {
            params: { limit: 8 }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch featured products:", error);
        return MOCK_PRODUCTS;
    }
};

// Мокап данные
const MOCK_PRODUCTS: Product[] = [
    {
        id: 1,
        name: "Alpha Complex Rapid Exfoliator",
        brand: "Holy Land",
        price: 24500,
        discountPrice: 19600,
        image: "/images/products/hl-alpha-complex.jpg",
        rating: 4.8,
        reviewsCount: 124,
        isNew: true,
    },
    {
        id: 2,
        name: "Unstress Probiotic Day Cream SPF 15",
        brand: "Christina",
        price: 32000,
        image: "/images/products/christina-unstress.jpg",
        rating: 4.9,
        reviewsCount: 89,
        isBestseller: true,
    },
    {
        id: 3,
        name: "Phyto Corrective Gel",
        brand: "Image Skincare",
        price: 28900,
        image: "/images/products/image-phyto.jpg",
        rating: 4.7,
        reviewsCount: 156,
    },
    {
        id: 4,
        name: "Hydra Vital Factor K",
        brand: "Janssen Cosmetics",
        price: 18500,
        discountPrice: 14800,
        image: "/images/products/janssen-hydra.jpg",
        rating: 4.6,
        reviewsCount: 203,
    },
];

export default function FeaturedProducts() {
    const { data: products = MOCK_PRODUCTS, isLoading } = useQuery({
        queryKey: ["featured-products"],
        queryFn: fetchFeaturedProducts,
        staleTime: 1000 * 60 * 15, // Кешируем на 15 минут
    });

    return (
        <section className="py-16 sm:py-20 px-4">
            <div className="container mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-3xl sm:text-4xl font-bold text-forest dark:text-beige-light mb-4"
                    >
                        Популярные товары
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-brown dark:text-beige max-w-2xl mx-auto"
                    >
                        Бестселлеры и новинки профессиональной косметики
                    </motion.p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {isLoading
                        ? // Loading skeletons
                        Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="bg-white dark:bg-forest/50 rounded-2xl p-4">
                                <Skeleton.Image className="w-full aspect-square mb-4" />
                                <Skeleton active paragraph={{ rows: 3 }} />
                            </div>
                        ))
                        : // Product cards
                        products.slice(0, 8).map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                viewport={{ once: true }}
                                className="group bg-white dark:bg-forest/50 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                            >
                                {/* Product Image */}
                                <div className="relative aspect-square overflow-hidden">
                                    {/* Badges */}
                                    <div className="absolute top-2 left-2 z-10 space-y-2">
                                        {product.isNew && (
                                            <span className="block bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Новинка
                        </span>
                                        )}
                                        {product.isBestseller && (
                                            <span className="block bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          Хит
                        </span>
                                        )}
                                        {product.discountPrice && (
                                            <span className="block bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                        </span>
                                        )}
                                    </div>

                                    {/* Wishlist Button */}
                                    <button className="absolute top-2 right-2 z-10 p-2 bg-white/80 dark:bg-forest/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <Heart className="w-4 h-4 text-forest dark:text-beige-light" />
                                    </button>

                                    {/* Product Image or Placeholder */}
                                    {product.image.startsWith("/") ? (
                                        <div className="w-full h-full bg-gradient-to-br from-beige-light to-mint/20 flex items-center justify-center">
                                            <span className="text-4xl">🧴</span>
                                        </div>
                                    ) : (
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    )}

                                    {/* Quick Actions Overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                                        <Link
                                            href={`/product/${product.id}`}
                                            className="p-3 bg-white rounded-full text-forest hover:bg-beige-light transition-colors"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </Link>
                                        <button className="p-3 bg-brown text-white rounded-full hover:bg-brown-light transition-colors">
                                            <ShoppingCart className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        {product.brand}
                                    </p>
                                    <h3 className="font-semibold text-forest dark:text-beige-light text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                                        {product.name}
                                    </h3>

                                    {/* Rating */}
                                    <div className="flex items-center space-x-1 mb-2">
                                        <div className="flex">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${
                                                        i < Math.floor(product.rating)
                                                            ? "text-yellow-400 fill-current"
                                                            : "text-gray-300"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({product.reviewsCount})
                      </span>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            {product.discountPrice ? (
                                                <>
                            <span className="text-lg font-bold text-red-500">
                              {formatPrice(product.discountPrice)}
                            </span>
                                                    <span className="text-sm text-gray-500 line-through ml-2">
                              {formatPrice(product.price)}
                            </span>
                                                </>
                                            ) : (
                                                <span className="text-lg font-bold text-forest dark:text-beige-light">
                            {formatPrice(product.price)}
                          </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                </div>

                {/* View All Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <Link
                        href="/catalog"
                        className="inline-flex items-center space-x-2 bg-brown dark:bg-brown-light text-white px-8 py-4 rounded-full hover:bg-brown-light dark:hover:bg-brown transition-colors group"
                    >
                        <span>Смотреть весь каталог</span>
                        <ShoppingCart className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}