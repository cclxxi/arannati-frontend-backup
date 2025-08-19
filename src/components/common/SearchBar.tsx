"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/utils/format";
import { api } from "@/lib/api/client";

interface SearchResult {
  id: number;
  name: string;
  brandName: string;
  regularPrice: number;
  salePrice?: number;
  mainImagePath?: string;
  sku: string;
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export default function SearchBar({
  className = "",
  placeholder = "Поиск товаров...",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Поиск товаров
  useEffect(() => {
    const searchProducts = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.searchProducts(debouncedQuery, 5);
        setResults(
          (response.data as { content: SearchResult[] }).content || [],
        );
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchProducts();
  }, [debouncedQuery]);

  // Закрытие результатов при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch}>
        <div className="flex items-center bg-white/80 dark:bg-forest/50 backdrop-blur rounded-full px-4 py-2.5">
          <Search className="text-gray-400 dark:text-gray-500 w-5 h-5 mr-2 flex-shrink-0" />
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
                      {product.mainImagePath ? (
                        <Image
                          src={product.mainImagePath}
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
                        <>
                          <p className="text-sm font-bold text-red-500">
                            {formatPrice(product.salePrice)}
                          </p>
                          <p className="text-xs text-gray-500 line-through">
                            {formatPrice(product.regularPrice)}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-bold text-forest dark:text-beige-light">
                          {formatPrice(product.regularPrice)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href={`/catalog?search=${encodeURIComponent(query)}`}
                onClick={() => setShowResults(false)}
                className="block p-3 text-center text-sm text-brown dark:text-brown-light hover:bg-gray-50 dark:hover:bg-forest/50 transition-colors border-t border-gray-100 dark:border-gray-700"
              >
                Показать все результаты
              </Link>
            </>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Ничего не найдено
            </div>
          )}
        </div>
      )}
    </div>
  );
}
