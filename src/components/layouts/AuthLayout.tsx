"use client";

import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui";
import { cn } from "@/utils/common";
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  className,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Левая часть с формой */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12 bg-white dark:bg-gray-900">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className={cn("w-full max-w-md mx-auto", className)}>
          <div className="mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold text-gradient">Arannati</h1>
            </Link>
            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>

      {/* Правая часть с изображением */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/90" />
        <Image
          className="absolute inset-0 h-full w-full object-cover mix-blend-multiply"
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2187&q=80"
          alt="Косметика"
          fill
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        <div className="absolute bottom-8 left-8 right-8 text-white">
          <h3 className="text-3xl font-bold mb-4">
            Профессиональная косметика для вашей красоты
          </h3>
          <p className="text-lg opacity-90">
            Откройте мир премиальных брендов и эксклюзивных предложений
          </p>
        </div>
      </div>
    </div>
  );
}
