"use client";

import React from "react";
import { Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "antd";

interface InstagramPost {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

// Функция для получения постов из Instagram
const fetchInstagramPosts = async (): Promise<InstagramPost[]> => {
  try {
    // Запрашиваем посты через наш API
    const response = await fetch("/api/instagram/posts?limit=3");
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch Instagram posts:", error);
    // Возвращаем мокап данные в случае ошибки
    return MOCK_POSTS;
  }
};

// Мокап данные для демонстрации
const MOCK_POSTS: InstagramPost[] = [
  {
    id: "1",
    media_type: "IMAGE",
    media_url: "/images/instagram/post1.jpg",
    permalink: "https://instagram.com/p/1",
    caption:
      "✨ Новинки Holy Land уже в наличии! Профессиональная косметика для вашей красоты 💫 #arannati #holylandcosmetics #профессиональнаякосметика",
    timestamp: new Date().toISOString(),
    like_count: 234,
    comments_count: 12,
  },
  {
    id: "2",
    media_type: "IMAGE",
    media_url: "/images/instagram/post2.jpg",
    permalink: "https://instagram.com/p/2",
    caption:
      "🌿 Семинар по уходу за кожей с экспертами Christina! Регистрация открыта 📝 #arannati #christina #обучениекосметологов",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    like_count: 189,
    comments_count: 8,
  },
  {
    id: "3",
    media_type: "IMAGE",
    media_url: "/images/instagram/post3.jpg",
    permalink: "https://instagram.com/p/3",
    caption:
      "💆‍♀️ Результаты применения линейки Janssen Cosmetics. Ваши клиенты будут в восторге! #arannati #janssencosmetics #результатыдоипосле",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    like_count: 312,
    comments_count: 24,
  },
];

export default function InstagramSection() {
  const { data: posts = MOCK_POSTS, isLoading } = useQuery({
    queryKey: ["instagram-posts"],
    queryFn: fetchInstagramPosts,
    staleTime: 1000 * 60 * 30, // Кешируем на 30 минут
    refetchOnWindowFocus: false,
  });

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} часов назад`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} дней назад`;
    } else {
      return date.toLocaleDateString("ru", {
        day: "numeric",
        month: "long",
      });
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-beige-light/30 to-mint/10 dark:from-forest/30 dark:to-mint/5 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-forest dark:text-beige-light mb-4 animate-fade-in">
            Мы в Instagram
          </h2>
          <p className="text-brown dark:text-beige max-w-2xl mx-auto mb-6 animate-fade-in animation-delay-200">
            Следите за новинками, акциями и полезными советами от экспертов
          </p>
          <a
            href="https://instagram.com/s.a.lab_cosmetics/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in animation-delay-400"
          >
            <Image
              className="w-5 h-5"
              src={"/images/meta/Instagram_Glyph_Gradient.svg"}
              alt="Instagram"
              width={24}
              height={24}
            />
            <span>@s.a.lab_cosmetics</span>
          </a>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {isLoading
            ? // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-forest/50 rounded-2xl overflow-hidden"
                >
                  <Skeleton.Image className="w-full aspect-square" />
                  <div className="p-4">
                    <Skeleton active paragraph={{ rows: 3 }} />
                  </div>
                </div>
              ))
            : // Instagram posts
              posts.map((post, index) => (
                <a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group bg-white dark:bg-forest/50 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-scale-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Post Image */}
                  <div className="relative aspect-square overflow-hidden">
                    {post.media_url.startsWith("/") ? (
                      <div className="w-full h-full bg-gradient-to-br from-brown/20 to-mint/20 flex items-center justify-center">
                        <Image
                          src={"/images/meta/Instagram_Glyph_Gradient.svg"}
                          alt="Instagram"
                          className="w-20 h-20
                                                text-brown/30"
                          width={40}
                          height={40}
                        />
                      </div>
                    ) : (
                      <Image
                        src={post.media_url}
                        alt={post.caption || "Instagram post"}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex items-center space-x-6 text-white">
                        <div className="flex items-center space-x-2">
                          <Heart className="w-6 h-6" fill="white" />
                          <span className="font-semibold">
                            {post.like_count || 0}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="w-6 h-6" fill="white" />
                          <span className="font-semibold">
                            {post.comments_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Post Caption */}
                  <div className="p-4">
                    {post.caption && (
                      <p className="text-sm text-forest dark:text-beige-light line-clamp-3 mb-2">
                        {post.caption}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(post.timestamp)}
                    </p>
                  </div>
                </a>
              ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-8 animate-fade-in">
          <a
            href="https://instagram.com/s.a.lab_cosmetics/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-brown dark:text-brown-light hover:text-brown-light dark:hover:text-brown transition-colors"
          >
            <span>Смотреть все публикации</span>
            <Image
              src={"/images/meta/Instagram_Glyph_Gradient.svg"}
              alt="Instagram"
              className="w-4 h-4"
              width={24}
              height={24}
            />
          </a>
        </div>
      </div>
    </section>
  );
}
