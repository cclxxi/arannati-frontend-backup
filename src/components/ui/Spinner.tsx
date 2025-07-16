"use client";

import { Spin, type SpinProps } from "antd";
import { cn } from "@/utils/common";

export interface SpinnerProps extends SpinProps {
  fullScreen?: boolean;
  overlay?: boolean;
  label?: string;
}

export function Spinner({
  fullScreen = false,
  overlay = false,
  label,
  className,
  size = "default",
  ...props
}: SpinnerProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm">
        <div className="text-center">
          <Spin size="large" {...props} />
          {label && <p className="mt-4 text-text-secondary">{label}</p>}
        </div>
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm rounded-lg">
        <Spin size={size} {...props} />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <Spin size={size} {...props} />
      {label && <span className="ml-3 text-text-secondary">{label}</span>}
    </div>
  );
}

// Page Loading компонент
export function PageLoading() {
  return <Spinner fullScreen label="Загрузка..." />;
}

// Skeleton компонент для загрузки контента
interface SkeletonProps {
  lines?: number;
  className?: string;
}

export function Skeleton({ lines = 3, className }: SkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse",
            i === lines - 1 && "w-3/4",
          )}
        />
      ))}
    </div>
  );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-surface rounded-lg overflow-hidden">
      <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
  );
}
