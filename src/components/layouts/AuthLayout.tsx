"use client";

import React from "react";
import Link from "next/link";
import { Logo, ThemeToggle } from "@/components/ui";
import { cn } from "@/utils/common";
import { ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
  showBackButton?: boolean;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  className,
  showBackButton = true,
}: AuthLayoutProps) {
  return (
    <>
      <div className="min-h-screen relative overflow-hidden bg-background">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
          <div
            className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-secondary/20 to-transparent rounded-full blur-3xl animate-pulse animation-delay-2000" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header */}
          <header className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Logo size="md" />
              <ThemeToggle />
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className={cn("w-full", className || "max-w-md")}>
              {/* Card container */}
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 sm:p-10 border border-border/50">
                {/* Back button */}
                {showBackButton && (
                  <Link
                    href="/"
                    className="inline-flex items-center text-sm text-text-secondary hover:text-primary transition-colors mb-6"
                  >
                    <ArrowLeft size={16} className="mr-1" />
                    Вернуться на главную
                  </Link>
                )}

                {/* Title section */}
                <div className="mb-8 text-center">
                  <h1 className="text-3xl font-bold text-text-primary dark:text-white">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="mt-2 text-text-secondary dark:text-gray-400">
                      {subtitle}
                    </p>
                  )}
                </div>

                {/* Form content */}
                <div>{children}</div>
              </div>

              {/* Additional links or info */}
              <div className="mt-8 text-center text-sm text-text-secondary">
                <p>
                  Возникли проблемы?{" "}
                  <Link
                    href="/contacts"
                    className="text-primary hover:text-primary-dark transition-colors font-medium"
                  >
                    Свяжитесь с нами
                  </Link>
                </p>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="py-6">
            <div className="container mx-auto px-4 text-center text-sm text-text-secondary">
              <p>
                &copy; {new Date().getFullYear()} Arannati. Все права защищены.
              </p>
            </div>
          </footer>
        </div>
      </div>
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.3;
          }
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </>
  );
}
