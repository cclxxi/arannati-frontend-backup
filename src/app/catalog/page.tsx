// src/app/catalog/page.tsx
"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { Search, Grid, List, SlidersHorizontal } from "lucide-react";
import {
  Input,
  Select,
  Checkbox,
  Button,
  Drawer,
  Tag,
  Spin,
  Empty,
} from "antd";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import ProductCardInteractive from "@/components/catalog/ProductCardInteractive";
import { motion, AnimatePresence } from "framer-motion";
import type { ProductDTO } from "@/types/api";
import { useAuth } from "@/hooks/queries/useAuth";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import Header from "@/components/common/Header";
import { useSearchParams, useRouter } from "next/navigation";
import { catalogApi } from "@/lib/api/services/catalog";
import { useFiltersStore } from "@/stores/filters";
import CatalogFiltersSync from "@/components/catalog/CatalogFiltersSync";
const { Option } = Select;

interface Filters {
  search: string;
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  sort: string;
}

// Исправлено: корректная сигнатура компонента без синтаксических ошибок
function CatalogContent() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<Filters>({
    search: "",
    sort: "sortOrder,asc",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const setFilterInStore = useFiltersStore((s) => s.setFilter);

  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
  });

  // Инициализация stores
  const { isAuthenticated } = useAuth();
  const fetchCart = useCartStore((state) => state.fetchCart);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);

  // Загружаем данные корзины и вишлиста при авторизации
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  // Синхронизация фильтров из URL (brandId, categoryId) в локальный стейт и zustand
  useEffect(() => {
    const brandIdStr = searchParams.get("brandId");
    const categoryIdStr = searchParams.get("categoryId");

    let changed = false;

    if (brandIdStr) {
      const id = Number(brandIdStr);
      if (Number.isFinite(id)) {
        setFilters((prev) => ({ ...prev, brandId: id }));
        setFilterInStore("brandId", id);
        changed = true;
      }
    }

    if (categoryIdStr) {
      const id = Number(categoryIdStr);
      if (Number.isFinite(id)) {
        setFilters((prev) => ({ ...prev, categoryId: id }));
        setFilterInStore("categoryId", id);
        changed = true;
      }
    }

    if (changed) {
      router.replace("/catalog");
    }
  }, [searchParams, setFilterInStore, router]);

  // Загрузка категорий и брендов для фильтров из реальных API
  const { data: categories = [] } = useQuery<
    Array<{ id: number; name: string }>
  >({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        return await catalogApi.getCategories();
      } catch {
        return [];
      }
    },
  });

  const { data: brands = [] } = useQuery<Array<{ id: number; name: string }>>({
    queryKey: ["brands"],
    queryFn: async () => {
      try {
        return await catalogApi.getBrands();
      } catch {
        return [];
      }
    },
  });

  // Загрузка товаров с бесконечным скроллом через catalogApi
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["catalog", filters],
    queryFn: async ({ pageParam = 0 }) => {
      return await catalogApi.getProducts({
        page: pageParam,
        size: 20,
        sort: filters.sort,
        search: filters.search?.trim() || undefined,
        categoryId: filters.categoryId,
        brandId: filters.brandId,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        onSale: filters.onSale,
      });
    },
    getNextPageParam: (lastPage, pages) => {
      if ((lastPage as { last?: boolean })?.last === true) return undefined;
      return pages.length;
    },
    initialPageParam: 0,
  });

  // Дебаунс для поиска
  const debouncedSearch = useCallback(
    (value: string) => {
      setFilters((prev) => ({ ...prev, search: value }));
    },
    [setFilters],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedSearch(searchInput);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchInput, debouncedSearch]);

  // Автоматическая подгрузка при скролле
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

  const handleFilterChange = (
    key: keyof Filters,
    value: string | string[] | number | boolean | undefined,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // при изменении бренд/категории руками — синхронизируем и в zustand
    if (key === "brandId" && typeof value === "number") {
      setFilterInStore("brandId", value);
    }
    if (key === "categoryId" && typeof value === "number") {
      setFilterInStore("categoryId", value);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      sort: "sortOrder,asc",
    });
    setSearchInput("");
    setFilterInStore("brandId", undefined as unknown as number); // сбросим в сторе
    setFilterInStore("categoryId", undefined as unknown as number);
  };

  const activeFiltersCount = Object.keys(filters).filter(
    (key) => key !== "sort" && filters[key as keyof Filters],
  ).length;

  const products =
    data?.pages.flatMap(
      (page) => (page as { content?: ProductDTO[] })?.content || [],
    ) || [];

  const sortOptions = [
    { value: "sortOrder,asc", label: "По популярности" },
    { value: "regularPrice,asc", label: "Сначала дешевые" },
    { value: "regularPrice,desc", label: "Сначала дорогие" },
    { value: "salePrice,desc", label: "По размеру скидки" },
    { value: "createdAt,desc", label: "Новинки" },
  ];

  // Компонент фильтров (для переиспользования в drawer)
  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Категории */}
      <div>
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
          Категория
        </h4>
        <Select
          placeholder="Все категории"
          value={filters.categoryId}
          onChange={(value) => handleFilterChange("categoryId", value)}
          allowClear
          className="w-full"
        >
          {categories.map((category) => (
            <Option key={category.id} value={category.id}>
              {category.name}
            </Option>
          ))}
        </Select>
      </div>

      {/* Бренды (если есть) */}
      {brands.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
            Бренд
          </h4>
          <Select
            placeholder="Все бренды"
            value={filters.brandId}
            onChange={(value) => handleFilterChange("brandId", value)}
            allowClear
            className="w-full"
          >
            {brands.map((brand) => (
              <Option key={brand.id} value={brand.id}>
                {brand.name}
              </Option>
            ))}
          </Select>
        </div>
      )}

      {/* Цена */}
      <div>
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
          Цена, ₸
        </h4>
        <div className="flex gap-2 mb-3">
          <Input
            type="number"
            placeholder="От"
            value={filters.minPrice}
            onChange={(e) =>
              handleFilterChange(
                "minPrice",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
          <Input
            type="number"
            placeholder="До"
            value={filters.maxPrice}
            onChange={(e) =>
              handleFilterChange(
                "maxPrice",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
        </div>
      </div>

      {/* Акционные товары */}
      <div>
        <Checkbox
          checked={filters.onSale}
          onChange={(e) => handleFilterChange("onSale", e.target.checked)}
        >
          Только со скидкой
        </Checkbox>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-light via-white to-mint/10 dark:from-forest dark:via-gray-900 dark:to-forest/50 transition-colors duration-500">
      {/* Header */}
      <Header hideSearch={true} />

      {/* Синхронизация фильтров из URL (brandId/categoryId) в zustand */}
      <CatalogFiltersSync />

      {/* Хедер каталога */}
      <div className="bg-white/95 dark:bg-forest/95 backdrop-blur-lg shadow-sm sticky top-20 z-10 mt-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Поиск */}
            <div className="flex-1 max-w-xl">
              <Input
                size="large"
                placeholder="Поиск товаров..."
                prefix={<Search className="w-5 h-5 text-gray-400" />}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                allowClear
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Фильтры для мобильных */}
              <Button
                icon={<SlidersHorizontal className="w-4 h-4" />}
                onClick={() => setShowFilters(true)}
                className="lg:hidden"
              >
                Фильтры
                {activeFiltersCount > 0 && (
                  <Tag color="red" className="ml-2">
                    {activeFiltersCount}
                  </Tag>
                )}
              </Button>

              {/* Сортировка */}
              <Select
                value={filters.sort}
                onChange={(value) => handleFilterChange("sort", value)}
                className="w-48"
                size="large"
              >
                {sortOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>

              {/* Переключатель вида */}
              <div className="flex bg-beige/20 dark:bg-forest/30 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid"
                      ? "bg-brown text-white shadow-md"
                      : "text-forest dark:text-beige-light hover:text-brown dark:hover:text-brown-light"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "list"
                      ? "bg-brown text-white shadow-md"
                      : "text-forest dark:text-beige-light hover:text-brown dark:hover:text-brown-light"
                  }`}
                  aria-label="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Боковые фильтры (десктоп) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white/80 dark:bg-forest/80 backdrop-blur-md rounded-xl p-6 sticky top-32 shadow-lg border border-beige/20 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-forest dark:text-beige-light">
                  Фильтры
                </h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-brown hover:text-brown-light transition-colors"
                  >
                    Очистить
                  </button>
                )}
              </div>
              <FiltersContent />
            </div>
          </aside>

          {/* Список товаров */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spin size="large" />
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <Empty description="Ошибка загрузки товаров" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Empty description="Товары не найдены" />
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  Найдено товаров: {products.length}
                  {isFetchingNextPage && " (загрузка...)"}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        : "space-y-4"
                    }
                  >
                    {products.map((product: ProductDTO, index: number) => (
                      <motion.div
                        key={`product-${product.id}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <ProductCardInteractive
                          product={product}
                          viewMode={viewMode}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Индикатор загрузки следующей страницы */}
                {products.length > 0 && (
                  <div
                    ref={ref}
                    className="flex justify-center py-8 min-h-[100px]"
                  >
                    {isFetchingNextPage ? (
                      <Spin size="large" />
                    ) : hasNextPage ? (
                      <div className="text-gray-400">
                        Прокрутите для загрузки
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">
                        Все товары загружены
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Drawer с фильтрами для мобильных */}
      <Drawer
        title="Фильтры"
        placement="left"
        onClose={() => setShowFilters(false)}
        open={showFilters}
        width={300}
      >
        <div className="flex justify-between mb-4">
          <span className="text-sm text-gray-600">
            Активных: {activeFiltersCount}
          </span>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Очистить все
            </button>
          )}
        </div>
        <FiltersContent />
      </Drawer>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-beige-light via-white to-mint/10 dark:from-forest dark:via-gray-900 dark:to-forest/50 transition-colors duration-500">
          <div className="flex justify-center items-center h-screen">
            <Spin size="large" />
          </div>
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
