// app/api/brands/info/route.ts
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// Определение типа для конфигурации бренда
interface BrandConfig {
  id: number;
  name: string;
  logo: string;
  country: string;
  shortDescription: string;
  sourceUrl: string | null;
  selectors?: BrandSelectors;
  fullDescription?: string;
}

// Конфигурация брендов с селекторами для парсинга
const BRANDS_CONFIG: BrandConfig[] = [
  {
    id: 1,
    name: "ATACHE",
    logo: "/images/brand_logos/atache_logo.svg",
    country: "Испания",
    shortDescription: "Профессиональная косметика премиум класса",
    sourceUrl: "https://kosmo-estetic.ru/brends/kosmetika-atache",
    selectors: {
      description: ".brand-description, .content-text",
    },
  },
  {
    id: 2,
    name: "Image Skincare",
    logo: "/images/brand_logos/image_skincare_logo.svg",
    country: "США",
    shortDescription: "Инновационная косметика для профессионального ухода",
    sourceUrl: "https://imageskincare.ru/our-story/the-image-difference",
    selectors: {
      // Для Image Skincare нужно будет извлекать текст из изображений или использовать OCR
      description: ".story-content, .brand-story",
    },
  },
  {
    id: 3,
    name: "IPH",
    logo: "/images/brand_logos/iph_logo.png",
    country: "Россия",
    shortDescription: "Пептидная косметика нового поколения",
    sourceUrl: "https://milfey-shop.ru/iph-peptides",
    selectors: {
      description: ".brand-info, .description",
    },
  },
  {
    id: 4,
    name: "LEVISSIME",
    logo: "/images/brand_logos/levissime_logo.png",
    country: "Испания",
    shortDescription: "Испанская медицинская косметика",
    sourceUrl: "https://levissime.ru/about",
    selectors: {
      description: ".about-content, .text-content",
    },
  },
  {
    id: 5,
    name: "VAGHEGGI",
    logo: "/images/brand_logos/vagheggi_logo.png",
    country: "Италия",
    shortDescription: "Итальянская фитокосметика",
    sourceUrl: "https://vagheggi.pro/ru",
    selectors: {
      description: ".brand-description, .about-text",
    },
  },
  {
    id: 6,
    name: "VEC",
    logo: "/images/brand_logos/vec_logo.svg",
    country: "Россия",
    shortDescription: "Российская инновационная косметика",
    sourceUrl: "https://veccosmetic.com/company",
    selectors: {
      description: ".company-info, .about-company",
    },
  },
  {
    id: 7,
    name: "Yon-Ka",
    logo: "/images/brand_logos/yonka_logo_black.svg",
    country: "Франция",
    shortDescription: "Французская аромафитотерапия",
    sourceUrl: "https://yonka.ru/our-values",
    selectors: {
      description: ".values-content, .brand-values",
    },
  },
  {
    id: 8,
    name: "Liposomal Vitamins",
    logo: "/images/brand_logos/liposomals_logo.png",
    country: "Россия",
    shortDescription: "Липосомальные витамины и БАДы нового поколения",
    sourceUrl: null, // У этого бренда нет отдельного сайта
    fullDescription:
      "Liposomal Vitamins - это инновационная линия липосомальных витаминов и биологически активных добавок, разработанных с использованием передовых технологий инкапсулирования. Липосомальная технология обеспечивает максимальную биодоступность активных веществ, защищая их от разрушения в желудочно-кишечном тракте и обеспечивая целевую доставку в клетки организма.",
  },
];

// Определение типа для селекторов
interface BrandSelectors {
  description?: string;
}

// Функция для парсинга HTML и извлечения описания
async function parseBrandDescription(
  url: string,
  selectors: BrandSelectors,
): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Пробуем различные селекторы
    let description = "";

    // Пробуем заданные селекторы
    if (selectors.description) {
      const selectorsList = selectors.description.split(", ");
      for (const selector of selectorsList) {
        const content = $(selector).text().trim();
        if (content) {
          description = content;
          break;
        }
      }
    }

    // Если не нашли по селекторам, пробуем общие паттерны
    if (!description) {
      // Ищем метатег description
      description = $('meta[name="description"]').attr("content") || "";

      // Если нет, ищем первый большой параграф
      if (!description) {
        const paragraphs = $("p");
        paragraphs.each((_i, el) => {
          const text = $(el).text().trim();
          if (text.length > 100 && !description) {
            description = text;
          }
        });
      }
    }

    // Очищаем и форматируем текст
    description = description
      .replace(/\s+/g, " ")
      .replace(/\n+/g, " ")
      .trim()
      .substring(0, 500); // Ограничиваем длину

    return description || null;
  } catch (error: unknown) {
    console.error(`Error parsing ${url}:`, error);
    return null;
  }
}

// Определение типа для информации о бренде
interface BrandInfo {
  id: number;
  name: string;
  logo: string;
  country: string;
  shortDescription: string;
  fullDescription: string;
  sourceUrl: string | null;
  lastUpdated: string;
}

// Кеш для хранения результатов парсинга
const cache = new Map<string, { data: BrandInfo[]; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 часа

export async function GET(): Promise<NextResponse> {
  try {
    // Проверяем кеш
    const cacheKey = "brands-info";
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // Парсим информацию о брендах
    const brandsInfo = await Promise.all(
      BRANDS_CONFIG.map(async (brand) => {
        let fullDescription = brand.fullDescription;

        // Если есть URL и нет готового описания, парсим
        if (brand.sourceUrl && !fullDescription) {
          const parsedDescription = await parseBrandDescription(
            brand.sourceUrl,
            brand.selectors || {},
          );

          if (parsedDescription) {
            fullDescription = parsedDescription;
          }
        }

        return {
          id: brand.id,
          name: brand.name,
          logo: brand.logo,
          country: brand.country,
          shortDescription: brand.shortDescription,
          fullDescription: fullDescription || brand.shortDescription,
          sourceUrl: brand.sourceUrl,
          lastUpdated: new Date().toISOString(),
        };
      }),
    );

    // Сохраняем в кеш
    cache.set(cacheKey, {
      data: brandsInfo,
      timestamp: Date.now(),
    });

    return NextResponse.json(brandsInfo);
  } catch (error: unknown) {
    console.error("Error fetching brands info:", error);

    // В случае ошибки возвращаем базовую информацию
    return NextResponse.json(
      BRANDS_CONFIG.map((brand) => ({
        id: brand.id,
        name: brand.name,
        logo: brand.logo,
        country: brand.country,
        shortDescription: brand.shortDescription,
        fullDescription: brand.fullDescription || brand.shortDescription,
        sourceUrl: brand.sourceUrl,
        lastUpdated: new Date().toISOString(),
      })),
    );
  }
}
