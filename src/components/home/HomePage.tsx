"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Phone,
  MapPin,
  Mail,
  Heart,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { useTheme } from "@/hooks";

// Импортируем компоненты секций
import BrandsSection from "./BrandsSection";
import InstagramSection from "./InstagramSection";
import FeaturedProducts from "./FeaturedProducts";

// Категории каталога
const CATEGORIES = [
  { id: 1, name: "Очищение", icon: "💧", count: 156 },
  { id: 2, name: "Увлажнение", icon: "💦", count: 203 },
  { id: 3, name: "Питание", icon: "🌿", count: 178 },
  { id: 4, name: "Антивозрастной уход", icon: "✨", count: 145 },
  { id: 5, name: "Защита от солнца", icon: "☀️", count: 89 },
  { id: 6, name: "Маски и пилинги", icon: "🎭", count: 167 },
];

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { isDark, toggleTheme } = useTheme();

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
    <div className="min-h-screen bg-gradient-to-br from-beige-light via-white to-mint/10 dark:from-forest dark:via-gray-900 dark:to-forest/50 transition-colors duration-500">
      {/* Header */}
      <header
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 dark:bg-forest/95 backdrop-blur-lg shadow-lg"
            : "bg-white/80 dark:bg-forest/80 backdrop-blur-md"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Logo className="h-12 w-auto" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                href="/catalog"
                className="text-forest dark:text-beige-light hover:text-brown dark:hover:text-brown-light transition-colors font-medium"
              >
                Каталог
              </Link>
              <Link
                href="/brands"
                className="text-forest dark:text-beige-light hover:text-brown dark:hover:text-brown-light transition-colors font-medium"
              >
                Бренды
              </Link>
              <Link
                href="/cosmetologist"
                className="text-forest dark:text-beige-light hover:text-brown dark:hover:text-brown-light transition-colors font-medium"
              >
                Косметологам
              </Link>
              <Link
                href="/about"
                className="text-forest dark:text-beige-light hover:text-brown dark:hover:text-brown-light transition-colors font-medium"
              >
                О нас
              </Link>
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex items-center bg-white/80 dark:bg-forest/50 backdrop-blur rounded-full px-4 py-2 w-80 xl:w-96">
              <Search className="text-gray-400 dark:text-gray-500 w-5 h-5 mr-2" />
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none flex-1 text-forest dark:text-beige-light placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors"
                aria-label="Сменить тему"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-beige-light" />
                ) : (
                  <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-forest" />
                )}
              </button>

              {/* Wishlist */}
              <button className="relative p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-forest dark:text-beige-light" />
                <span className="absolute -top-1 -right-1 bg-brown dark:bg-brown-light text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Cart */}
              <button className="relative p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-forest dark:text-beige-light" />
                <span className="absolute -top-1 -right-1 bg-brown dark:bg-brown-light text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  2
                </span>
              </button>

              {/* Login Button */}
              <Link
                href="/auth/login"
                className="hidden sm:flex items-center space-x-2 bg-brown dark:bg-brown-light text-white px-4 py-2 rounded-full hover:bg-brown-light dark:hover:bg-brown transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Войти</span>
              </Link>

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
            <div className="flex items-center bg-gray-100 dark:bg-forest/50 rounded-full px-4 py-2">
              <Search className="text-gray-400 w-5 h-5 mr-2" />
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none flex-1 text-forest dark:text-beige-light"
              />
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <Link
                href="/catalog"
                className="block py-2 text-forest dark:text-beige-light hover:text-brown dark:hover:text-brown-light"
                onClick={() => setIsMenuOpen(false)}
              >
                Каталог
              </Link>
              <Link
                href="/brands"
                className="block py-2 text-forest dark:text-beige-light hover:text-brown dark:hover:text-brown-light"
                onClick={() => setIsMenuOpen(false)}
              >
                Бренды
              </Link>
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

            {/* Mobile Login Button */}
            <Link
              href="/auth/login"
              className="flex items-center justify-center space-x-2 bg-brown dark:bg-brown-light text-white px-4 py-3 rounded-full hover:bg-brown-light dark:hover:bg-brown transition-colors w-full"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="w-5 h-5" />
              <span>Войти</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-forest/50 backdrop-blur px-4 py-2 rounded-full mb-6 animate-fade-in">
            <Sparkles className="w-5 h-5 text-brown dark:text-brown-light" />
            <span className="text-brown dark:text-beige font-medium">
              Профессиональная космецевтика мировых брендов
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-forest dark:text-beige-light mb-6 animate-slide-up">
            Красота начинается
            <br />с правильного ухода
          </h1>

          <p className="text-lg sm:text-xl text-brown dark:text-beige mb-8 max-w-2xl mx-auto px-4 animate-slide-up animation-delay-200">
            ТОО АРАННАТИ – с 2006 года лидер рынка космецевтики, эстетической
            косметологии, БАДов и расходных материалов Казахстана и Кыргызстана.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up animation-delay-400">
            <Link
              href="/catalog"
              className="bg-brown dark:bg-brown-light text-white px-8 py-4 rounded-full hover:bg-brown-light dark:hover:bg-brown transition-colors flex items-center space-x-2 group"
            >
              <span>Перейти в каталог</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/cosmetologist/register"
              className="bg-white/80 dark:bg-forest/50 backdrop-blur text-forest dark:text-beige-light px-8 py-4 rounded-full hover:bg-white dark:hover:bg-forest/70 transition-colors"
            >
              Стать косметологом
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="animate-fade-in-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-forest dark:text-beige-light mb-4">
                О компании Arannati
              </h2>
              <p className="text-brown dark:text-beige mb-6 leading-relaxed">
                Мы являемся эксклюзивным дистрибьютором ведущих мировых брендов
                профессиональной косметики в Казахстане с 2006 года.
              </p>
              <p className="text-brown dark:text-beige mb-6 leading-relaxed">
                Наша миссия - предоставить косметологам и их клиентам доступ к
                лучшим мировым брендам и инновационным решениям для ухода за
                кожей.
              </p>
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-brown dark:text-brown-light">
                    19+
                  </div>
                  <div className="text-sm text-brown dark:text-beige">
                    лет на рынке
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-brown dark:text-brown-light">
                    8
                  </div>
                  <div className="text-sm text-brown dark:text-beige">
                    премиум брендов
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-brown dark:text-brown-light">
                    500+
                  </div>
                  <div className="text-sm text-brown dark:text-beige">
                    партнеров
                  </div>
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in-right">
              <div className="bg-gradient-to-br from-mint/30 to-brown/30 dark:from-mint/20 dark:to-brown/20 backdrop-blur-md rounded-3xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-white/90 dark:bg-forest/50 rounded-2xl p-8 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center justify-center h-48 sm:h-64">
                    <div className="text-6xl sm:text-8xl">🌿</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <BrandsSection />

      {/* Catalog Section */}
      <section className="py-16 sm:py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-forest dark:text-beige-light mb-4 animate-fade-in">
              Каталог продукции
            </h2>
            <p className="text-brown dark:text-beige max-w-2xl mx-auto animate-fade-in animation-delay-200">
              Более 2000 наименований профессиональной косметики для решения
              любых задач
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((category, index) => (
              <a
                key={category.id}
                href={`/catalog?category=${category.id}`}
                className="group bg-white/80 dark:bg-forest/50 backdrop-blur rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl sm:text-4xl mb-3 transform group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-forest dark:text-beige-light text-sm sm:text-base">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {category.count} товаров
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Instagram Section */}
      <InstagramSection />

      {/* Footer */}
      <footer className="bg-forest dark:bg-black text-white py-12 sm:py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <Logo className="h-10 w-auto filter brightness-0 invert" />
              <p className="text-beige-light text-sm">
                Профессиональная косметика премиум класса
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://instagram.com/s.a.lab_cosmetics/"
                  className="hover:text-brown-light transition-colors"
                >
                  <Image
                    src={"images/meta/Instagram_Glyph_Gradient.svg"}
                    alt="Instagram"
                    className="w-5 h-5"
                    width={24}
                    height={24}
                  />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold mb-4 text-beige">Быстрые ссылки</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/catalog"
                    className="hover:text-brown-light transition-colors"
                  >
                    Каталог
                  </Link>
                </li>
                <li>
                  <Link
                    href="/brands"
                    className="hover:text-brown-light transition-colors"
                  >
                    Бренды
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="hover:text-brown-light transition-colors"
                  >
                    О нас
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-bold mb-4 text-beige">Контакты</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>+7 (701) 111 82 54</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>arannati-aesthetic@mail.ru</span>
                </li>
                <li className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    г. Алматы, ул. Макатаева 127/11 блок 2, офис 426, офис 469
                  </span>
                </li>
              </ul>
            </div>

            {/* Working Hours */}
            <div>
              <h3 className="font-bold mb-4 text-beige">Режим работы</h3>
              <ul className="space-y-2 text-sm">
                <li>Пн-Пт: 9:00 - 18:00</li>
                <li>Сб: 10:00 - 16:00</li>
                <li>Вс: Выходной</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-beige-light">
            <p>&copy; 2025 Arannati. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
