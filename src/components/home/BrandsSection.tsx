"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "antd";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Данные о брендах с правильными описаниями для Arannati
const BRANDS_DATA = [
  {
    id: 1,
    name: "ATACHE",
    logo: "/images/brand_logos/atache_logo.svg",
    country: "Испания",
    shortDescription: "Профессиональная косметика премиум класса",
    fullDescription:
      "ATACHE - испанский бренд профессиональной косметики, основанный в 1983 году. Специализируется на создании инновационных формул с использованием передовых технологий и высококачественных ингредиентов. Эксклюзивно представлен в Казахстане компанией Arannati.",
  },
  {
    id: 2,
    name: "Image Skincare",
    logo: "/images/brand_logos/image_skincare_logo.svg",
    country: "США",
    shortDescription: "Инновационная косметика для профессионального ухода",
    fullDescription:
      "Image Skincare - американский бренд, лидер в области профессиональной косметики. Продукция бренда основана на использовании стволовых клеток растений, пептидов и AHA кислот. Официальный дистрибьютор в Казахстане - компания Arannati.",
  },
  {
    id: 3,
    name: "IPH",
    logo: "/images/brand_logos/iph_logo.png",
    country: "Россия",
    shortDescription: "Пептидная косметика нового поколения",
    fullDescription:
      "IPH - инновационный бренд пептидной косметики, разработанный на основе последних достижений в области молекулярной биологии. Продукция содержит короткие регуляторные пептиды для эффективного омоложения. Представлен в Казахстане компанией Arannati.",
  },
  {
    id: 4,
    name: "LEVISSIME",
    logo: "/images/brand_logos/levissime_logo.png",
    country: "Испания",
    shortDescription: "Испанская медицинская косметика",
    fullDescription:
      "LEVISSIME - профессиональная косметика из Испании для салонов красоты и домашнего ухода. Бренд известен своими альгинатными масками и средствами для профессиональных процедур. Эксклюзивный дистрибьютор в Казахстане - Arannati.",
  },
  {
    id: 5,
    name: "VAGHEGGI",
    logo: "/images/brand_logos/vagheggi_logo.png",
    country: "Италия",
    shortDescription: "Итальянская фитокосметика",
    fullDescription:
      "VAGHEGGI - итальянский бренд с более чем 45-летней историей. Специализируется на создании фитокосметики с использованием натуральных экстрактов и эфирных масел. В Казахстане представлен компанией Arannati.",
  },
  {
    id: 6,
    name: "VEC",
    logo: "/images/brand_logos/vec_logo.svg",
    country: "Россия",
    shortDescription: "Российская инновационная косметика",
    fullDescription:
      "VEC Cosmetics - современный бренд профессиональной косметики, сочетающий передовые технологии и натуральные компоненты. Широкий ассортимент средств для решения различных проблем кожи. Официальный представитель в Казахстане - Arannati.",
  },
  {
    id: 7,
    name: "Yon-Ka",
    logo: "/images/brand_logos/yonka_logo_black.svg",
    country: "Франция",
    shortDescription: "Французская аромафитотерапия",
    fullDescription:
      "Yon-Ka - французский бренд с 1954 года, пионер в области аромафитотерапии. Продукция основана на силе эфирных масел и растительных экстрактов. Эксклюзивно представлен в Казахстане компанией Arannati.",
  },
  {
    id: 8,
    name: "Liposomal Vitamins",
    logo: "/images/brand_logos/liposomals_logo.png",
    country: "Россия",
    shortDescription: "Липосомальные витамины и БАДы нового поколения",
    fullDescription:
      "Liposomal Vitamins - инновационная линия липосомальных витаминов и биологически активных добавок. Липосомальная технология обеспечивает максимальную биодоступность активных веществ. В Казахстане эксклюзивно представлен компанией Arannati.",
  },
];

interface BrandInfo {
  id: number;
  name: string;
  logo: string;
  country: string;
  shortDescription: string;
  fullDescription?: string;
}

export default function BrandsSection() {
  const [selectedBrand, setSelectedBrand] = useState<BrandInfo | null>(null);

  // Используем статичные данные вместо парсинга
  const { data: brands = BRANDS_DATA, isLoading } = useQuery({
    queryKey: ["brands-info"],
    queryFn: async () => BRANDS_DATA,
    staleTime: Infinity, // Данные не меняются
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
                  onClick={() => setSelectedBrand(brand)}
                  className={`group relative bg-white dark:bg-forest/50 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer animate-scale-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-brown/5 to-mint/5 dark:from-brown-light/5 dark:to-mint/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

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
                          {brand.name.substring(0, 2)}
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
                    <p className="text-xs text-brown/70 dark:text-beige/70 text-center line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {brand.shortDescription}
                    </p>
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
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-forest dark:text-beige-light leading-relaxed">
                  {selectedBrand.fullDescription ||
                    selectedBrand.shortDescription}
                </p>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Эксклюзивный дистрибьютор в Казахстане - компания Arannati
                  </p>
                </div>
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
