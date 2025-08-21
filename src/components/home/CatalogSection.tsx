// src/components/home/CatalogSection.tsx
"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

// Иконки для категорий (можно настроить под ваши категории)
const CATEGORY_ICONS: Record<string, string> = {
  Очищение: "💧",
  Увлажнение: "💦",
  Питание: "🌿",
  "Антивозрастной уход": "✨",
  "Защита от солнца": "☀️",
  "Маски и пилинги": "🎭",
  "Уход за телом": "🧴",
  "Уход за волосами": "💇‍♀️",
  Макияж: "💄",
  Парфюмерия: "🌸",
};

interface Category {
  id: number;
  name: string;
  productCount?: number;
  slug?: string;
}

interface ProductsResponseWithCategories {
  categories?: Category[];
  [key: string]: unknown;
}

export default function CatalogSection() {
  // Загружаем категории из API
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        // Пытаемся получить категории через эндпоинт категорий
        const response = await api.getProducts({
          size: "0", // Получаем только метаданные
        });

        // Если есть информация о категориях в метаданных
        if (
          response.data &&
          typeof response.data === "object" &&
          "categories" in response.data
        ) {
          const typedResponse = response.data as ProductsResponseWithCategories;
          if (
            typedResponse.categories &&
            Array.isArray(typedResponse.categories)
          ) {
            return typedResponse.categories;
          }
        }

        // Иначе используем статические категории
        // В будущем здесь должен быть отдельный эндпоинт для категорий
        return [
          { id: 1, name: "Очищение", productCount: 156 },
          { id: 2, name: "Увлажнение", productCount: 203 },
          { id: 3, name: "Питание", productCount: 178 },
          { id: 4, name: "Антивозрастной уход", productCount: 145 },
          { id: 5, name: "Защита от солнца", productCount: 89 },
          { id: 6, name: "Маски и пилинги", productCount: 167 },
        ];
      } catch (error) {
        console.error("Failed to load categories:", error);
        // Возвращаем статические категории в случае ошибки
        return [
          { id: 1, name: "Очищение", productCount: 156 },
          { id: 2, name: "Увлажнение", productCount: 203 },
          { id: 3, name: "Питание", productCount: 178 },
          { id: 4, name: "Антивозрастной уход", productCount: 145 },
          { id: 5, name: "Защита от солнца", productCount: 89 },
          { id: 6, name: "Маски и пилинги", productCount: 167 },
        ];
      }
    },
    staleTime: 5 * 60 * 1000, // Кэшируем на 5 минут
  });

  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-forest dark:text-beige-light mb-8">
            Каталог продукции
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-6 h-32"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-forest dark:text-beige-light mb-8">
          Каталог продукции
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category: Category) => (
            <Link
              key={category.id}
              href={`/catalog?category=${encodeURIComponent(category.name)}`}
              className="group bg-gradient-to-br from-white/80 to-mint/10 dark:from-forest/50 dark:to-forest/30 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 text-center"
            >
              <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">
                {CATEGORY_ICONS[category.name] || "📦"}
              </div>
              <h3 className="font-medium text-forest dark:text-beige-light mb-1">
                {category.name}
              </h3>
              {category.productCount && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {category.productCount} товаров
                </p>
              )}
              <ChevronRight className="w-4 h-4 mx-auto mt-2 text-mint opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-mint to-forest text-white rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Весь каталог
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
