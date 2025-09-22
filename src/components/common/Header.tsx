"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Logo, ThemeToggle } from "@/components/ui";
import { useTheme } from "@/hooks";
import SearchBar from "@/components/common/SearchBar";
import { CartWishlistIcons } from "@/components/common/CartWishlistIcons";
import AccountButton from "@/components/common/AccountButton";
import { Dropdown, type MenuProps } from "antd";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api/services/catalog";
import { useFiltersStore } from "@/stores";

interface HeaderProps {
  className?: string;
  hideSearch?: boolean;
}

export default function Header({
  className = "",
  hideSearch = false,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isDark } = useTheme();
  const router = useRouter();
  const setFilter = useFiltersStore((s) => s.setFilter);

  // Загружаем бренды из БД
  const { data: brands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: () => catalogApi.getBrands(),
    staleTime: 5 * 60 * 1000,
  });

  // Формируем items для Dropdown: применяем фильтр бренда и переходим в каталог
  const brandMenuItems: MenuProps["items"] = useMemo(
    () =>
      (brands || []).map((brand) => ({
        key: String(brand.id),
        label: brand.name,
        onClick: () => {
          // мгновенно применяем в zustand для текущей сессии
          setFilter("brandId", brand.id);
          // переходим в каталог с query, чтобы каталог синхронизировал фильтр у себя
          router.push(
            `/catalog?brandId=${encodeURIComponent(String(brand.id))}`,
          );
          setIsMenuOpen(false);
        },
      })),
    [brands, router, setFilter],
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Закрываем мобильное меню при изменении размера экрана
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-forest/95 backdrop-blur-lg shadow-lg"
          : "bg-white/80 dark:bg-forest/80 backdrop-blur-md"
      } ${className}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Logo
            className={`h-12 sm:h-14 md:h-16 lg:h-18 xl:h-20 w-auto flex-shrink-0 ${!isDark ? "pt-4 ml-0 lg:mr-4" : "lg:pr-3"}`}
            size="lg"
          />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 2xl:space-x-8">
            <Link
              href="/catalog"
              className="text-forest dark:text-beige-light hover:text-brown dark:hover:text-brown-light transition-colors font-medium whitespace-nowrap"
            >
              Каталог
            </Link>
            <Dropdown
              menu={{ items: brandMenuItems }}
              placement="bottom"
              trigger={["hover"]}
              disabled={brandsLoading || brands.length === 0}
            >
              <div className="flex items-center cursor-pointer text-forest dark:text-beige-light hover:text-brown dark:hover:text-brown-light transition-colors font-medium whitespace-nowrap">
                Бренды
                <ChevronDown className="ml-1 w-4 h-4" />
              </div>
            </Dropdown>
            <Link
              href="/cosmetologist"
              className="text-forest dark:text-beige-light hover:text-brown dark:hover:text-brown-light transition-colors font-medium whitespace-nowrap"
            >
              Косметологам
            </Link>
            <Link
              href="/about"
              className="text-forest dark:text-beige-light hover:text-brown dark:hover:text-brown-light transition-colors font-medium whitespace-nowrap"
            >
              О нас
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          {!hideSearch && (
            <SearchBar className="hidden lg:block w-80 xl:w-96 ml-4" />
          )}

          {/* Right Side Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4 ml-4">
            {/* Theme Toggle - component implementation */}
            <ThemeToggle />

            {/* Cart and Wishlist Icons */}
            <CartWishlistIcons />

            {/* Login/Account Button */}
            <AccountButton />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors"
              aria-label="Меню"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-forest dark:text-beige-light" />
              ) : (
                <Menu className="w-6 h-6 text-forest dark:text-beige-light" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden bg-white/95 dark:bg-forest/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isMenuOpen
            ? "max-h-screen opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="container mx-auto px-4 py-4 space-y-4">
          {/* Mobile Search */}
          {!hideSearch && <SearchBar className="w-full" />}

          {/* Mobile Navigation */}
          <nav className="space-y-2">
            <Link
              href="/catalog"
              className="block py-2 text-forest dark:text-beige-light hover:text-brown dark:hover:text-brown-light"
              onClick={() => setIsMenuOpen(false)}
            >
              Каталог
            </Link>
            <Dropdown
              menu={{
                items: brandMenuItems,
                onClick: () => setIsMenuOpen(false),
              }}
              placement="bottomLeft"
              trigger={["click"]}
              disabled={brandsLoading || brands.length === 0}
            >
              <div className="flex items-center justify-between py-2 text-forest dark:text-beige-light hover:text-brown dark:hover:text-brown-light cursor-pointer">
                Бренды
                <ChevronDown className="ml-1 w-4 h-4" />
              </div>
            </Dropdown>
            <Link
              href="/cosmetologist"
              className="block py-2 text-forest dark:text-beige-light hover:text-brown dark:hover:text-brown-light"
              onClick={() => setIsMenuOpen(false)}
            >
              Косметологам
            </Link>
            <Link
              href="/about"
              className="block py-2 text-forest dark:text-beige-light hover:text-brown dark:hover:text-brown-light"
              onClick={() => setIsMenuOpen(false)}
            >
              О нас
            </Link>
          </nav>

          {/* Mobile Login/Account Button - Hidden on md screens */}
          <div className="md:hidden">
            <AccountButton
              isMobile={true}
              onMobileMenuClose={() => setIsMenuOpen(false)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
