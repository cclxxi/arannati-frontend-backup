"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "antd";
import { ExternalLink, RefreshCw, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Данные о брендах с их официальными сайтами
const BRANDS_DATA = [
  {
    id: 1,
    name: "ATACHE",
    logo: "/images/brand_logos/atache_logo.svg",
    country: "Испания",
    shortDescription: "Профессиональная косметика премиум класса",
    sourceUrl: "https://kosmo-estetic.ru/brends/kosmetika-atache",
  },
  {
    id: 2,
    name: "Image Skincare",
    logo: "/images/brand_logos/image_skincare_logo.svg",
    country: "США",
    shortDescription: "Инновационная косметика для профессионального ухода",
    sourceUrl: "https://imageskincare.ru/our-story/the-image-difference",
  },
  {
    id: 3,
    name: "IPH",
    logo: "/images/brand_logos/iph_logo.png",
    country: "Россия",
    shortDescription: "Пептидная косметика нового поколения",
    sourceUrl: "https://milfey-shop.ru/iph-peptides",
  },
  {
    id: 4,
    name: "LEVISSIME",
    logo: "/images/brand_logos/levissime_logo.png",
    country: "Испания",
    shortDescription: "Испанская медицинская косметика",
    sourceUrl: "https://levissime.ru/about",
  },
  {
    id: 5,
    name: "VAGHEGGI",
    logo: "/images/brand_logos/vagheggi_logo.png",
    country: "Италия",
    shortDescription: "Итальянская фитокосметика",
    sourceUrl: "https://vagheggi.pro/ru",
  },
  {
    id: 6,
    name: "VEC",
    logo: "/images/brand_logos/vec_logo.svg",
    country: "Россия",
    shortDescription: "Российская инновационная косметика",
    sourceUrl: "https://veccosmetic.com/company",
  },
  {
    id: 7,
    name: "Yon-Ka",
    logo: "/images/brand_logos/yonka_logo_black.svg",
    country: "Франция",
    shortDescription: "Французская аромафитотерапия",
    sourceUrl: "https://yonka.ru/our-values",
  },
  {
    id: 8,
    name: "Liposomal Vitamins",
    logo: "/images/brand_logos/liposomals_logo.png",
    country: "Россия",
    shortDescription: "Липосомальные витамины и БАДы нового поколения",
    sourceUrl: null, // У этого бренда нет отдельного сайта
  },
];

interface BrandInfo {
  id: number;
  name: string;
  logo: string;
  country: string;
  shortDescription: string;
  fullDescription?: string;
  sourceUrl?: string | null;
  lastUpdated?: string;
}

// Функция для получения информации о брендах
const fetchBrandsInfo = async (): Promise<BrandInfo[]> => {
  try {
    // Запрашиваем информацию с нашего API, который парсит сайты брендов
    const response = await fetch("/api/brands/info");
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    // Если API недоступен, возвращаем статичные данные
    console.error("Failed to fetch brands info:", error);
    return BRANDS_DATA;
  }
};

export default function BrandsSection() {
  const [hoveredBrand, setHoveredBrand] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<BrandInfo | null>(null);

  // Используем React Query для кеширования данных о брендах
  const {
    data: brands = BRANDS_DATA,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["brands-info"],
    queryFn: fetchBrandsInfo,
    staleTime: 1000 * 60 * 60 * 24, // Кешируем на 24 часа
    refetchOnWindowFocus: false,
  });

  return (
    <section className="py-16 sm:py-20 bg-white/50 dark:bg-forest/30 backdrop-blur-sm px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-forest dark:text-beige-light mb-4 animate-fade-in">
            Наши бренды
          </h2>
          <p className="text-brown dark:text-beige max-w-2xl mx-auto animate-fade-in animation-delay-200">
            Мы работаем только с проверенными мировыми лидерами в области
            профессиональной косметики
          </p>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => refetch()}
            className="flex items-center space-x-2 text-brown dark:text-beige-light hover:text-brown-light dark:hover:text-brown-light transition-colors"
            title="Обновить информацию о брендах"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Обновить</span>
          </button>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {isLoading
            ? // Loading skeletons
              Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-forest/50 rounded-2xl p-6"
                >
                  <Skeleton.Avatar size={80} className="mx-auto mb-4" />
                  <Skeleton active paragraph={{ rows: 2 }} />
                </div>
              ))
            : // Brands cards
              brands.map((brand, index) => (
                <div
                  key={brand.id}
                  onMouseEnter={() => setHoveredBrand(brand.id)}
                  onMouseLeave={() => setHoveredBrand(null)}
                  onClick={() => setSelectedBrand(brand)}
                  className={`group relative bg-white dark:bg-forest/50 rounded-2xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer animate-scale-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-brown/10 to-mint/10 dark:from-brown-light/10 dark:to-mint/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="relative">
                    {/* Brand Logo */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 relative">
                      {brand.logo.startsWith("/") ? (
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          fill
                          sizes="(max-width: 640px) 80px, (max-width: 1024px) 100px, 120px"
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brown to-brown-light rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
                          {brand.logo}
                        </div>
                      )}
                    </div>

                    {/* Brand Info */}
                    <h3 className="font-bold text-forest dark:text-beige-light text-center mb-1 text-sm sm:text-base">
                      {brand.name}
                    </h3>
                    <p className="text-xs text-brown dark:text-beige text-center mb-2">
                      {brand.country}
                    </p>

                    {/* Hover Description */}
                    <div
                      className={`overflow-hidden transition-all duration-200 ${
                        hoveredBrand === brand.id
                          ? "max-h-20 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="text-xs text-brown dark:text-beige text-center line-clamp-2">
                        {brand.shortDescription}
                      </p>
                      {brand.sourceUrl && (
                        <div className="flex justify-center mt-2">
                          <ExternalLink className="w-3 h-3 text-brown/50 dark:text-beige/50" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* Brand Modal */}
        {selectedBrand && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedBrand(null)}
          >
            <div
              className="bg-white dark:bg-forest rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-forest dark:text-beige-light mb-2">
                    {selectedBrand.name}
                  </h3>
                  <p className="text-brown dark:text-beige">
                    {selectedBrand.country}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBrand(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-forest dark:text-beige-light leading-relaxed">
                  {selectedBrand.fullDescription ||
                    selectedBrand.shortDescription}
                </p>

                {selectedBrand.sourceUrl && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <a
                      href={selectedBrand.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-brown dark:text-brown-light hover:underline"
                    >
                      <span>Узнать больше на официальном сайте</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {selectedBrand.lastUpdated && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Информация обновлена:{" "}
                    {new Date(selectedBrand.lastUpdated).toLocaleDateString(
                      "ru",
                    )}
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Link
                  href={`/catalog?brand=${selectedBrand.id}`}
                  className="bg-brown dark:bg-brown-light text-white px-6 py-3 rounded-full hover:bg-brown-light dark:hover:bg-brown transition-colors"
                >
                  Посмотреть товары бренда
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
