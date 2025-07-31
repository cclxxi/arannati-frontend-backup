"use client";

import React from "react";
import { cn } from "@/utils/common";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export function GlassCard({
  children,
  className,
  hover = true,
  delay = 0,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={cn(
        "relative overflow-hidden rounded-xl",
        "bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl",
        "border border-white/20 dark:border-gray-700/50",
        "shadow-lg shadow-gray-900/5 dark:shadow-black/20",
        hover &&
          "transition-all duration-200 hover:shadow-xl hover:shadow-gray-900/10 dark:hover:shadow-black/30",
        className,
      )}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent dark:from-white/5 pointer-events-none" />

      {/* Content */}
      <div className="relative">{children}</div>
    </motion.div>
  );
}

interface GlassCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCardHeader({ children, className }: GlassCardHeaderProps) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface GlassCardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCardBody({ children, className }: GlassCardBodyProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}
