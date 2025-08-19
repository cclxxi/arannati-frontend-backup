// app/api/products/featured/route.ts
import { NextRequest, NextResponse } from "next/server";

// Мокап данные для демонстрации
const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: "Alpha Complex Rapid Exfoliator",
    brand: "Holy Land",
    price: 24500,
    discountPrice: 19600,
    image: "/images/products/product-placeholder.jpg",
    rating: 4.8,
    reviewsCount: 124,
    isNew: true,
  },
  {
    id: 2,
    name: "Unstress Probiotic Day Cream SPF 15",
    brand: "Christina",
    price: 32000,
    image: "/images/products/product-placeholder.jpg",
    rating: 4.9,
    reviewsCount: 89,
    isBestseller: true,
  },
  {
    id: 3,
    name: "Phyto Corrective Gel",
    brand: "Image Skincare",
    price: 28900,
    image: "/images/products/product-placeholder.jpg",
    rating: 4.7,
    reviewsCount: 156,
  },
  {
    id: 4,
    name: "Hydra Vital Factor K",
    brand: "Janssen Cosmetics",
    price: 18500,
    discountPrice: 14800,
    image: "/images/products/product-placeholder.jpg",
    rating: 4.6,
    reviewsCount: 203,
  },
  {
    id: 5,
    name: "Retinol Treatment",
    brand: "LEVISSIME",
    price: 35000,
    image: "/images/products/product-placeholder.jpg",
    rating: 4.9,
    reviewsCount: 178,
    isNew: true,
  },
  {
    id: 6,
    name: "Vitamin C Serum",
    brand: "VAGHEGGI",
    price: 27500,
    discountPrice: 22000,
    image: "/images/products/product-placeholder.jpg",
    rating: 4.7,
    reviewsCount: 234,
  },
  {
    id: 7,
    name: "Hydrating Mask",
    brand: "Yon-Ka",
    price: 15900,
    image: "/images/products/product-placeholder.jpg",
    rating: 4.5,
    reviewsCount: 145,
    isBestseller: true,
  },
  {
    id: 8,
    name: "Anti-Aging Complex",
    brand: "VEC",
    price: 42000,
    discountPrice: 33600,
    image: "/images/products/product-placeholder.jpg",
    rating: 4.8,
    reviewsCount: 267,
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "8", 10);

  // Симулируем небольшую задержку для реалистичности
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Возвращаем ограниченное количество товаров
  const products = FEATURED_PRODUCTS.slice(0, limit);

  return NextResponse.json(products);
}
