// src/components/home/CatalogSection.tsx
"use client";

import React, { useMemo } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api/services/catalog";
import { useRouter } from "next/navigation";
import { useFiltersStore } from "@/stores/filters";

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

type Category = {
  id: number;
  name: string;
};

export default function CatalogSection() {
  const router = useRouter();
  const setFilter = useFiltersStore((s) => s.setFilter);

  // Грузим категории из БД
  const { data: categories = [], isLoading } = useQuery<Array<Category>>({
    queryKey: ["categories"],
    queryFn: () => catalogApi.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const sorted = useMemo(
    () =>
      [...categories].sort((a, b) =>
        a.name.localeCompare(b.name, "ru", { sensitivity: "base" }),
      ),
    [categories],
  );

  const onCategoryClick = (categoryId: number) => {
    // мгновенно применяем в zustand
    setFilter("categoryId", categoryId);
    // переходим в каталог с query, каталог синхронизирует фильтр и очистит URL
    router.push(
      `/catalog?categoryId=${encodeURIComponent(String(categoryId))}`,
    );
  };

  const scrollBy = (dir: "left" | "right") => {
    const container = document.getElementById("home-categories-scroll");
    if (!container) return;
    const delta = dir === "left" ? -400 : 400;
    container.scrollBy({ left: delta, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-forest dark:text-beige-light mb-8">
            Категории
          </h2>
          <div className="relative">
            <div className="flex gap-3 overflow-hidden">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse h-10 min-w-[140px] rounded-full bg-gray-200 dark:bg-gray-700"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!sorted.length) {
    return null;
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-forest dark:text-beige-light">
            Категории
          </h2>
          <div className="hidden md:flex gap-2">
            <button
              aria-label="Прокрутить влево"
              onClick={() => scrollBy("left")}
              className="p-2 rounded-full bg-white/80 dark:bg-forest/60 hover:bg-white shadow border border-beige/30 dark:border-gray-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              aria-label="Прокрутить вправо"
              onClick={() => scrollBy("right")}
              className="p-2 rounded-full bg-white/80 dark:bg-forest/60 hover:bg-white shadow border border-beige/30 dark:border-gray-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Горизонтальный скролл “чипсов” */}
        <div className="relative">
          <div
            id="home-categories-scroll"
            className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-beige/50 dark:scrollbar-thumb-gray-700 pb-2"
          >
            {sorted.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryClick(category.id)}
                className="group flex items-center gap-2 px-4 h-10 rounded-full bg-gradient-to-r from-white/80 to-mint/10 dark:from-forest/60 dark:to-forest/40 hover:shadow-md hover:-translate-y-[1px] transition-all border border-beige/30 dark:border-gray-700 whitespace-nowrap"
              >
                <span className="text-lg">
                  {CATEGORY_ICONS[category.name] || "📦"}
                </span>
                <span className="text-sm font-medium text-forest dark:text-beige-light">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
