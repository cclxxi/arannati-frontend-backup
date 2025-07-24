"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/utils/common";
import { useTheme } from "@/hooks";

export interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "text";
  href?: string;
  forceTheme?: "light" | "dark"; // Для принудительного выбора версии логотипа
}

export function Logo({
  className,
  size = "md",
  variant = "full",
  href = "/",
  forceTheme,
}: LogoProps) {
  const { resolvedTheme } = useTheme();

  // Определяем какой логотип использовать
  const theme = forceTheme || resolvedTheme;
  const logoSrc =
    theme === "dark"
      ? "/images/logo-white.svg"
      : "/images/logo-transparent.svg";

  const sizeConfig = {
    sm: { height: 32, width: 120 },
    md: { height: 40, width: 150 },
    lg: { height: 48, width: 180 },
    xl: { height: 64, width: 240 },
  };

  const iconSizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  // Fallback компонент если изображение не загрузится
  const LogoFallback = () => (
    <div
      className={cn(
        "flex items-center justify-center bg-secondary text-accent font-bold rounded",
        iconSizeClasses[size],
      )}
    >
      АР
    </div>
  );

  const LogoText = () => (
    <span
      className={cn(
        "font-brand font-bold text-text-primary tracking-wide",
        textSizeClasses[size],
      )}
    >
      АРАННАТИ
    </span>
  );

  const LogoImage = () => (
    <div className="relative" style={{ height: sizeConfig[size].height }}>
      <Image
        src={logoSrc}
        alt="Arannati"
        height={sizeConfig[size].height}
        width={sizeConfig[size].width}
        className="object-contain"
        priority
        onError={(e) => {
          // Если изображение не загрузилось, показываем fallback
          e.currentTarget.style.display = "none";
          e.currentTarget.nextElementSibling?.classList.remove("hidden");
        }}
      />
      <div className="hidden">
        <LogoFallback />
      </div>
    </div>
  );

  const LogoContent = () => {
    if (variant === "icon") {
      return <LogoFallback />;
    }

    if (variant === "text") {
      return <LogoText />;
    }

    // Full variant - image or fallback
    return <LogoImage />;
  };

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center transition-opacity hover:opacity-80",
        className,
      )}
      aria-label="Arannati - Главная"
    >
      <LogoContent />
    </Link>
  );
}

// Компонент для использования в местах с известным фоном
export function LogoWhite({
  className,
  size = "md",
  href = "/",
}: Omit<LogoProps, "variant" | "forceTheme">) {
  const sizeConfig = {
    sm: { height: 32, width: 120 },
    md: { height: 40, width: 150 },
    lg: { height: 48, width: 180 },
    xl: { height: 64, width: 240 },
  };

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center transition-opacity hover:opacity-80",
        className,
      )}
      aria-label="Arannati - Главная"
    >
      <Image
        src="/images/logo-white.svg"
        alt="Arannati"
        height={sizeConfig[size].height}
        width={sizeConfig[size].width}
        className="object-contain"
        priority
      />
    </Link>
  );
}

// Компонент для использования на светлом фоне
export function LogoTransparent({
  className,
  size = "md",
  href = "/",
}: Omit<LogoProps, "variant" | "forceTheme">) {
  const sizeConfig = {
    sm: { height: 32, width: 120 },
    md: { height: 40, width: 150 },
    lg: { height: 48, width: 180 },
    xl: { height: 64, width: 240 },
  };

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center transition-opacity hover:opacity-80",
        className,
      )}
      aria-label="Arannati - Главная"
    >
      <Image
        src="/images/logo-transparent.svg"
        alt="Arannati"
        height={sizeConfig[size].height}
        width={sizeConfig[size].width}
        className="object-contain"
        priority
      />
    </Link>
  );
}
