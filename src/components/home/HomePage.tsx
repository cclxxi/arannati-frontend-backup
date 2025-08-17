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
} from "lucide-react";
import Image from "next/image";

// Данные о брендах
const BRANDS = [
  {
    id: 1,
    name: "Holy Land",
    country: "Израиль",
    description: "Профессиональная косметика премиум класса",
    logo: "HL",
  },
  {
    id: 2,
    name: "Christina",
    country: "Израиль",
    description: "Инновационная косметика для профессионального ухода",
    logo: "CH",
  },
  {
    id: 3,
    name: "Janssen Cosmetics",
    country: "Германия",
    description: "Немецкая косметика с научным подходом",
    logo: "JC",
  },
  {
    id: 4,
    name: "Mesoestetic",
    country: "Испания",
    description: "Испанская медицинская косметика",
    logo: "ME",
  },
  {
    id: 5,
    name: "Dermalogica",
    country: "США",
    description: "Американская профессиональная косметика",
    logo: "DL",
  },
  {
    id: 6,
    name: "Babor",
    country: "Германия",
    description: "Немецкая роскошная косметика",
    logo: "BA",
  },
  {
    id: 7,
    name: "Algologie",
    country: "Франция",
    description: "Косметика на основе морских водорослей",
    logo: "AL",
  },
  {
    id: 8,
    name: "Phyto",
    country: "Франция",
    description: "Французская фитокосметика для волос",
    logo: "PH",
  },
];

// Категории каталога
const CATEGORIES = [
  { id: 1, name: "Очищение", icon: "💧", count: 156 },
  { id: 2, name: "Увлажнение", icon: "💦", count: 203 },
  { id: 3, name: "Питание", icon: "🌿", count: 178 },
  { id: 4, name: "Антивозрастной уход", icon: "✨", count: 145 },
  { id: 5, name: "Защита от солнца", icon: "☀️", count: 89 },
  { id: 6, name: "Маски и пилинги", icon: "🎭", count: 167 },
];

// Мокап Instagram постов
const INSTAGRAM_POSTS = [
  {
    id: 1,
    image: "🌸",
    likes: 234,
    description: "Новинки Holy Land уже в наличии! Профессиональный уход...",
  },
  {
    id: 2,
    image: "💆‍♀️",
    likes: 456,
    description: "Секреты идеальной кожи от наших косметологов...",
  },
  {
    id: 3,
    image: "🎁",
    likes: 189,
    description: "Специальное предложение на линейку Christina...",
  },
];

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredBrand, setHoveredBrand] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#efe9df] via-[#f7ecd0] to-[#efe9df]">
      {/* Анимированный фон с жидким стеклом */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#b2cec0]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#bc7426]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#f7ecd0]/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-br from-[#bc7426] to-[#905630] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-2xl font-bold text-[#2a3a33]">
                Arannati
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a
                href="/catalog"
                className="text-[#2a3a33] hover:text-[#bc7426] transition-colors font-medium"
              >
                Каталог
              </a>
              <a
                href="/brands"
                className="text-[#2a3a33] hover:text-[#bc7426] transition-colors font-medium"
              >
                Бренды
              </a>
              <a
                href="/cosmetologist"
                className="text-[#2a3a33] hover:text-[#bc7426] transition-colors font-medium"
              >
                Косметологам
              </a>
              <a
                href="/about"
                className="text-[#2a3a33] hover:text-[#bc7426] transition-colors font-medium"
              >
                О нас
              </a>
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-white/80 backdrop-blur rounded-full px-4 py-2 w-80">
              <Search className="text-gray-400 w-5 h-5 mr-2" />
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none flex-1 text-[#2a3a33]"
              />
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-white/20 rounded-full transition-colors">
                <Heart className="w-6 h-6 text-[#2a3a33]" />
                <span className="absolute -top-1 -right-1 bg-[#bc7426] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="relative p-2 hover:bg-white/20 rounded-full transition-colors">
                <ShoppingCart className="w-6 h-6 text-[#2a3a33]" />
                <span className="absolute -top-1 -right-1 bg-[#bc7426] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  2
                </span>
              </button>
              <a
                href="/auth/login"
                className="flex items-center space-x-2 bg-[#bc7426] text-white px-4 py-2 rounded-full hover:bg-[#905630] transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Войти</span>
              </a>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-md border-t">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <a
                href="/catalog"
                className="block py-2 text-[#2a3a33] hover:text-[#bc7426]"
              >
                Каталог
              </a>
              <a
                href="/brands"
                className="block py-2 text-[#2a3a33] hover:text-[#bc7426]"
              >
                Бренды
              </a>
              <a
                href="/cosmetologist"
                className="block py-2 text-[#2a3a33] hover:text-[#bc7426]"
              >
                Косметологам
              </a>
              <a
                href="/about"
                className="block py-2 text-[#2a3a33] hover:text-[#bc7426]"
              >
                О нас
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-[#bc7426]" />
            <span className="text-[#905630] font-medium">
              Профессиональная косметика премиум класса
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-[#2a3a33] mb-6">
            Красота начинается
            <br />с правильного ухода
          </h1>
          <p className="text-xl text-[#905630] mb-8 max-w-2xl mx-auto">
            Эксклюзивный дистрибьютор ведущих мировых брендов профессиональной
            косметики в Казахстане
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/catalog"
              className="bg-[#bc7426] text-white px-8 py-4 rounded-full hover:bg-[#905630] transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Перейти в каталог</span>
              <ChevronRight className="w-5 h-5" />
            </a>
            <a
              href="/cosmetologist"
              className="bg-white/80 backdrop-blur text-[#2a3a33] px-8 py-4 rounded-full hover:bg-white transition-all transform hover:scale-105"
            >
              Стать партнером
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[#2a3a33] mb-6">
                О компании Arannati
              </h2>
              <p className="text-[#905630] mb-4 leading-relaxed">
                Мы являемся ведущим дистрибьютором профессиональной косметики в
                Казахстане с более чем 15-летним опытом работы на рынке
                beauty-индустрии.
              </p>
              <p className="text-[#905630] mb-6 leading-relaxed">
                Наша миссия - предоставить косметологам и их клиентам доступ к
                лучшим мировым брендам и инновационным решениям для ухода за
                кожей.
              </p>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#bc7426]">15+</div>
                  <div className="text-sm text-[#905630]">лет на рынке</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#bc7426]">8</div>
                  <div className="text-sm text-[#905630]">премиум брендов</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#bc7426]">500+</div>
                  <div className="text-sm text-[#905630]">партнеров</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-[#b2cec0]/30 to-[#bc7426]/30 backdrop-blur-md rounded-3xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-white/90 rounded-2xl p-8 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center justify-center h-64">
                    <div className="text-6xl">🌿</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#2a3a33] mb-4">
              Наши бренды
            </h2>
            <p className="text-[#905630] max-w-2xl mx-auto">
              Мы работаем только с проверенными мировыми лидерами в области
              профессиональной косметики
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {BRANDS.map((brand) => (
              <div
                key={brand.id}
                onMouseEnter={() => setHoveredBrand(brand.id)}
                onMouseLeave={() => setHoveredBrand(null)}
                className="group relative bg-white rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#bc7426]/10 to-[#b2cec0]/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#bc7426] to-[#905630] rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {brand.logo}
                  </div>
                  <h3 className="font-bold text-[#2a3a33] text-center mb-1">
                    {brand.name}
                  </h3>
                  <p className="text-xs text-[#905630] text-center mb-2">
                    {brand.country}
                  </p>
                  {hoveredBrand === brand.id && (
                    <p className="text-xs text-[#905630] text-center animate-fade-in">
                      {brand.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#2a3a33] mb-4">
              Каталог продукции
            </h2>
            <p className="text-[#905630] max-w-2xl mx-auto">
              Более 2000 наименований профессиональной косметики для решения
              любых задач
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((category) => (
              <a
                key={category.id}
                href={`/catalog?category=${category.id}`}
                className="group bg-white/80 backdrop-blur rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-[#2a3a33] mb-1">
                  {category.name}
                </h3>
                <p className="text-xs text-[#905630]">
                  {category.count} товаров
                </p>
              </a>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href="/catalog"
              className="inline-flex items-center space-x-2 text-[#bc7426] hover:text-[#905630] font-medium"
            >
              <span>Весь каталог</span>
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="py-20 bg-gradient-to-br from-[#f7ecd0] to-[#efe9df]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#2a3a33] mb-4">Наш блог</h2>
            <p className="text-[#905630] max-w-2xl mx-auto mb-6">
              Следите за новинками и акциями в наших социальных сетях
            </p>
            <a
              href="https://instagram.com/arannati.kz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-[#bc7426] hover:text-[#905630] font-medium"
            >
              <Image
                className="w-5 h-5"
                src="/images/meta/Instagram_Glyph_Gradient.svg"
                alt="Instagram"
                width={20}
                height={20}
              />
              <span>@arannati.kz</span>
            </a>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {INSTAGRAM_POSTS.map((post) => (
              <a
                key={post.id}
                href={`https://instagram.com/p/${post.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="aspect-square bg-gradient-to-br from-[#bc7426]/10 to-[#b2cec0]/10 flex items-center justify-center text-6xl">
                  {post.image}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <Heart className="w-5 h-5 fill-current" />
                      <span>{post.likes}</span>
                    </div>
                    <p className="text-sm line-clamp-2">{post.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2a3a33] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo and Description */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#bc7426] to-[#905630] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <span className="text-xl font-bold">Arannati</span>
              </div>
              <p className="text-[#b2cec0] text-sm">
                Эксклюзивный дистрибьютор профессиональной косметики в
                Казахстане
              </p>
            </div>

            {/* Catalog */}
            <div>
              <h3 className="font-semibold mb-4">Каталог</h3>
              <ul className="space-y-2 text-sm text-[#b2cec0]">
                <li>
                  <a
                    href="/catalog/cleansing"
                    className="hover:text-white transition-colors"
                  >
                    Очищение
                  </a>
                </li>
                <li>
                  <a
                    href="/catalog/moisturizing"
                    className="hover:text-white transition-colors"
                  >
                    Увлажнение
                  </a>
                </li>
                <li>
                  <a
                    href="/catalog/nutrition"
                    className="hover:text-white transition-colors"
                  >
                    Питание
                  </a>
                </li>
                <li>
                  <a
                    href="/catalog/anti-age"
                    className="hover:text-white transition-colors"
                  >
                    Антивозрастной уход
                  </a>
                </li>
              </ul>
            </div>

            {/* Information */}
            <div>
              <h3 className="font-semibold mb-4">Информация</h3>
              <ul className="space-y-2 text-sm text-[#b2cec0]">
                <li>
                  <a
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    О компании
                  </a>
                </li>
                <li>
                  <a
                    href="/delivery"
                    className="hover:text-white transition-colors"
                  >
                    Доставка и оплата
                  </a>
                </li>
                <li>
                  <a
                    href="/cosmetologist"
                    className="hover:text-white transition-colors"
                  >
                    Косметологам
                  </a>
                </li>
                <li>
                  <a
                    href="/contacts"
                    className="hover:text-white transition-colors"
                  >
                    Контакты
                  </a>
                </li>
              </ul>
            </div>

            {/* Contacts */}
            <div>
              <h3 className="font-semibold mb-4">Контакты</h3>
              <ul className="space-y-3 text-sm text-[#b2cec0]">
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+7 (727) 123-45-67</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>info@arannati.kz</span>
                </li>
                <li className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 mt-1" />
                  <span>г. Алматы, ул. Абая 150</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Links */}
          <div className="border-t border-[#3e5349] pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-[#b2cec0] mb-4 md:mb-0">
              © 2024 Arannati. Все права защищены.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#3e5349] rounded-full hover:bg-[#4a5f55] transition-colors"
              >
                <Image
                  className="w-5 h-5"
                  src="/images/meta/Instagram_Glyph_White.svg"
                  alt="Instagram"
                  width={20}
                  height={20}
                />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#3e5349] rounded-full hover:bg-[#4a5f55] transition-colors"
              >
                <Image
                  className="w-5 h-5"
                  src="/images/meta/Facebook_Logo_Secondary.png"
                  alt="Facebook"
                  width={20}
                  height={20}
                />
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#3e5349] rounded-full hover:bg-[#4a5f55] transition-colors"
              >
                <Image
                  className="w-5 h-5"
                  src="/images/telegram/Telegram_logo.svg"
                  alt="Telegram"
                  width={20}
                  height={20}
                />
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#3e5349] rounded-full hover:bg-[#4a5f55] transition-colors"
              >
                <Image
                  className="w-5 h-5"
                  src="/images/meta/Print_Glyph_White.png"
                  alt="WhatsApp"
                  width={20}
                  height={20}
                />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
