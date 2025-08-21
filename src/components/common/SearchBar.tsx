// src/components/common/SearchBar.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { debounce } from "lodash";
import type { ProductDTO, PaginatedResponse } from "@/types/api";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export default function SearchBar({
  placeholder = "Поиск товаров...",
  className = "",
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Define response type to handle different API response formats
  type SearchResponse =
    | { data: ProductDTO[] }
    | { data: { data: { products: ProductDTO[] } } }
    | { data: { products: ProductDTO[] } }
    | { data: PaginatedResponse<ProductDTO> };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log("Searching for:", searchQuery); // Добавляем логирование
        const response = (await api.searchProducts(
          searchQuery,
          5,
        )) as SearchResponse;
        console.log("Search response:", response); // Логируем ответ

        // Проверяем разные форматы ответа от бэкенда
        let products: ProductDTO[] = [];

        if (response.data) {
          if (Array.isArray(response.data)) {
            products = response.data;
          } else if (
            "data" in response.data &&
            response.data.data?.products &&
            Array.isArray(response.data.data.products)
          ) {
            // Формат из логов: {data: {products: [...]}}
            products = response.data.data.products;
          } else if (
            "products" in response.data &&
            response.data.products &&
            Array.isArray(response.data.products)
          ) {
            products = response.data.products;
          } else if (
            "content" in response.data &&
            response.data.content &&
            Array.isArray(response.data.content)
          ) {
            // Spring Boot Page response
            products = response.data.content;
          }
        }

        console.log("Parsed products:", products); // Логируем результат
        setResults(products);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [],
  );

  useEffect(() => {
    if (query.length >= 2) {
      debouncedSearch(query);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  }, [query, debouncedSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".search-container")) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowResults(false);
      if (onSearch) {
        onSearch(query);
      } else {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "KZT",
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

  return (
    <div className={`relative search-container ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center bg-white/80 dark:bg-forest/30 backdrop-blur-md rounded-full px-4 py-2 border border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="bg-transparent outline-none flex-1 text-forest dark:text-beige-light placeholder-gray-500 dark:placeholder-gray-400 min-w-0"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (query.length >= 2 || isLoading) && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-forest rounded-2xl shadow-xl overflow-hidden z-50">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Поиск...
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="max-h-96 overflow-y-auto">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    onClick={() => setShowResults(false)}
                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-forest/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="w-12 h-12 relative mr-3 flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={
                            product.images[0]?.imagePath || "/placeholder.jpg"
                          }
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-2xl">🧴</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-forest dark:text-beige-light truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.brandName} • {product.sku}
                      </p>
                    </div>
                    <div className="text-right ml-3">
                      {product.salePrice ? (
                        <div>
                          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                            {formatPrice(product.salePrice)}
                          </p>
                          <p className="text-xs text-gray-500 line-through">
                            {formatPrice(product.regularPrice)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-forest dark:text-beige-light">
                          {formatPrice(product.regularPrice)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => setShowResults(false)}
                className="block p-3 text-center text-sm text-mint hover:bg-gray-50 dark:hover:bg-forest/50 transition-colors border-t border-gray-100 dark:border-gray-700"
              >
                Показать все результаты →
              </Link>
            </>
          ) : query.length >= 2 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                По запросу &quot;{query}&quot; ничего не найдено
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Попробуйте изменить запрос
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
