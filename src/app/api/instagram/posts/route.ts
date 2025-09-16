// app/api/instagram/posts/route.ts
import { NextRequest, NextResponse } from "next/server";

// Instagram Basic Display API configuration
const INSTAGRAM_API_BASE = "https://graph.instagram.com";
const INSTAGRAM_BUSINESS_ACCOUNT_ID =
  process.env["INSTAGRAM_BUSINESS_ACCOUNT_ID"];
const INSTAGRAM_ACCESS_TOKEN = process.env["INSTAGRAM_ACCESS_TOKEN"];

interface InstagramPost {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
}

interface InstagramMediaResponse {
  data: Array<{
    id: string;
    media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
    media_url: string;
    thumbnail_url?: string;
    permalink: string;
    caption?: string;
    timestamp: string;
    like_count?: number;
    comments_count?: number;
  }>;
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

// Кеш для хранения постов
const cache = new Map<string, { data: InstagramPost[]; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 минут

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "3", 10);

  try {
    // Проверяем наличие необходимых переменных окружения
    if (!INSTAGRAM_BUSINESS_ACCOUNT_ID || !INSTAGRAM_ACCESS_TOKEN) {
      console.warn("Instagram API credentials not configured");
      return NextResponse.json(getMockPosts(limit));
    }

    // Проверяем кеш
    const cacheKey = `instagram-posts-${limit}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // Запрашиваем посты из Instagram API
    const fields = [
      "id",
      "media_type",
      "media_url",
      "thumbnail_url",
      "permalink",
      "caption",
      "timestamp",
      "like_count",
      "comments_count",
    ].join(",");

    const url = `${INSTAGRAM_API_BASE}/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media?fields=${fields}&limit=${limit}&access_token=${INSTAGRAM_ACCESS_TOKEN}`;

    const response = await fetch(url, {
      next: { revalidate: 1800 }, // Ревалидация каждые 30 минут
    });

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`);
    }

    const data: InstagramMediaResponse = await response.json();

    // Фильтруем только изображения (исключаем видео для упрощения)
    const posts = data.data
      .filter(
        (post) =>
          post.media_type === "IMAGE" || post.media_type === "CAROUSEL_ALBUM",
      )
      .map((post) => ({
        id: post.id,
        media_type: post.media_type,
        media_url: post.media_url,
        thumbnail_url: post.thumbnail_url,
        permalink: post.permalink,
        caption: post.caption,
        timestamp: post.timestamp,
        like_count: post.like_count || 0,
        comments_count: post.comments_count || 0,
      }));

    // Сохраняем в кеш
    cache.set(cacheKey, {
      data: posts,
      timestamp: Date.now(),
    });

    return NextResponse.json(posts);
  } catch (error: unknown) {
    console.error("Error fetching Instagram posts:", error);

    // В случае ошибки возвращаем мокап данные
    return NextResponse.json(getMockPosts(limit));
  }
}

// Функция для генерации мокап данных
function getMockPosts(limit: number): InstagramPost[] {
  const mockPosts = [
    {
      id: "mock_1",
      media_type: "IMAGE" as const,
      media_url: "/images/instagram/post1.jpg",
      permalink: "https://instagram.com/p/mock1",
      caption:
        "✨ Новинки Holy Land уже в наличии! Профессиональная косметика для вашей красоты 💫\n\n#arannati #holylandcosmetics #профессиональнаякосметика #косметологиалматы #уходзакожей",
      timestamp: new Date().toISOString(),
      like_count: 234,
      comments_count: 12,
    },
    {
      id: "mock_2",
      media_type: "IMAGE" as const,
      media_url: "/images/instagram/post2.jpg",
      permalink: "https://instagram.com/p/mock2",
      caption:
        "🌿 Семинар по уходу за кожей с экспертами Christina!\n\n📅 15 января\n📍 Алматы, ул. Макатаева 127/11\n\nРегистрация открыта! Количество мест ограничено.\n\n#arannati #christina #обучениекосметологов #семинарыалматы",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      like_count: 189,
      comments_count: 8,
    },
    {
      id: "mock_3",
      media_type: "IMAGE" as const,
      media_url: "/images/instagram/post3.jpg",
      permalink: "https://instagram.com/p/mock3",
      caption:
        "💆‍♀️ Результаты применения линейки Janssen Cosmetics\n\nДо/После курса процедур с использованием профессиональной косметики Janssen.\n\nВаши клиенты будут в восторге! 🌟\n\n#arannati #janssencosmetics #результатыдоипосле #профессиональныйуход",
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      like_count: 312,
      comments_count: 24,
    },
    {
      id: "mock_4",
      media_type: "IMAGE" as const,
      media_url: "/images/instagram/post4.jpg",
      permalink: "https://instagram.com/p/mock4",
      caption:
        "🎁 Специальное предложение для косметологов!\n\nПри покупке от 100 000 тг - скидка 15% на всю линейку Image Skincare\n\nПредложение действует до конца января!\n\n#arannati #скидки #специальноепредложение",
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      like_count: 156,
      comments_count: 19,
    },
    {
      id: "mock_5",
      media_type: "IMAGE" as const,
      media_url: "/images/instagram/post5.jpg",
      permalink: "https://instagram.com/p/mock5",
      caption:
        "📚 Новая статья в блоге: 'Пептиды в косметологии: как работают и когда применять'\n\nЧитайте на нашем сайте!\n\n#arannati #образование #пептиды #косметология",
      timestamp: new Date(Date.now() - 345600000).toISOString(),
      like_count: 98,
      comments_count: 5,
    },
  ];

  return mockPosts.slice(0, limit);
}
