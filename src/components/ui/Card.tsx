"use client";

import { Card as AntCard, type CardProps as AntCardProps } from "antd";
import { cn } from "@/utils/common";
import { formatPrice } from "@/utils/format";
import { Button } from "./Button";
import Image from "next/image";

export interface CardProps extends Omit<AntCardProps, "variant"> {
  variant?: "default" | "bordered" | "shadow" | "ghost";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

const variantStyles = {
  default: "bg-white dark:bg-surface border-gray-200 dark:border-gray-700",
  bordered: "bg-white dark:bg-surface border-2 border-primary/20",
  shadow: "bg-white dark:bg-surface border-0 shadow-lg",
  ghost: "bg-transparent border-0 shadow-none",
};

const paddingStyles = {
  none: "[&_.ant-card-body]:p-0",
  sm: "[&_.ant-card-body]:p-3",
  md: "[&_.ant-card-body]:p-6",
  lg: "[&_.ant-card-body]:p-8",
};

export function Card({
  variant = "default",
  padding = "md",
  interactive = false,
  className,
  hoverable,
  ...props
}: CardProps) {
  return (
    <AntCard
      className={cn(
        "transition-all duration-200",
        variantStyles[variant],
        paddingStyles[padding],
        interactive && "cursor-pointer hover:shadow-xl hover:-translate-y-1",
        className,
      )}
      hoverable={hoverable || interactive}
      {...props}
    />
  );
}

// Product Card специфичный компонент
interface ProductCardProps {
  image: string;
  title: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  inWishlist?: boolean;
  onAddToCart?: () => void;
  onToggleWishlist?: () => void;
  onClick?: () => void;
  className?: string;
}

export function ProductCard({
  image,
  title,
  price,
  oldPrice,
  discount,
  rating,
  reviewCount,
  inWishlist,
  onAddToCart,
  onToggleWishlist,
  onClick,
  className,
}: ProductCardProps) {
  return (
    <Card
      variant="default"
      padding="none"
      interactive
      className={cn("group relative overflow-hidden", className)}
      onClick={onClick}
    >
      {/* Скидка */}
      {discount && (
        <div className="absolute top-2 left-2 z-10 bg-error text-white px-2 py-1 rounded text-sm font-medium">
          -{discount}%
        </div>
      )}

      {/* Избранное */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist?.();
        }}
        className="absolute top-2 right-2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
      >
        <svg
          className={cn(
            "w-5 h-5 transition-colors",
            inWishlist
              ? "fill-primary text-primary"
              : "fill-none text-gray-400",
          )}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* Изображение */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Контент */}
      <div className="p-4">
        <h3 className="font-medium text-text-primary line-clamp-2 mb-2">
          {title}
        </h3>

        {/* Рейтинг */}
        {rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-warning">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < Math.floor(rating) ? "fill-current" : "fill-none",
                  )}
                  viewBox="0 0 20 20"
                  stroke="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-text-secondary">
              {rating} ({reviewCount})
            </span>
          </div>
        )}

        {/* Цена */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-primary">
            {formatPrice(price)}
          </span>
          {oldPrice && (
            <span className="text-sm text-text-secondary line-through">
              {formatPrice(oldPrice)}
            </span>
          )}
        </div>

        {/* Кнопка */}
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.();
          }}
        >
          В корзину
        </Button>
      </div>
    </Card>
  );
}
