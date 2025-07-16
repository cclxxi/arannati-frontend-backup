"use client";

import { Badge as AntBadge, type BadgeProps as AntBadgeProps } from "antd";
import { cn } from "@/utils/common";
import React from "react";

export interface BadgeProps extends AntBadgeProps {
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
}

const variantColors = {
  primary: "#E91E63",
  secondary: "#9C27B0",
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#F44336",
  info: "#2196F3",
};

export function Badge({
  variant = "primary",
  color,
  className,
  ...props
}: BadgeProps) {
  return (
    <AntBadge
      color={color || variantColors[variant]}
      className={cn("", className)}
      {...props}
    />
  );
}

// Status Badge компонент
interface StatusBadgeProps {
  status: "active" | "inactive" | "pending" | "success" | "error";
  text?: string;
  className?: string;
}

const statusConfig = {
  active: { status: "success" as const, text: "Активно" },
  inactive: { status: "default" as const, text: "Неактивно" },
  pending: { status: "warning" as const, text: "Ожидает" },
  success: { status: "success" as const, text: "Успешно" },
  error: { status: "error" as const, text: "Ошибка" },
};

export function StatusBadge({ status, text, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <AntBadge
      status={config.status}
      text={text || config.text}
      className={cn("", className)}
    />
  );
}

// Tag компонент
interface TagProps {
  children: React.ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "default";
  size?: "sm" | "md";
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}

const tagVariantStyles = {
  primary: "bg-primary/10 text-primary border-primary/20",
  secondary: "bg-secondary/10 text-secondary border-secondary/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  error: "bg-error/10 text-error border-error/20",
  info: "bg-info/10 text-info border-info/20",
  default:
    "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
};

export function Tag({
  children,
  variant = "default",
  size = "md",
  closable,
  onClose,
  className,
}: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium transition-colors",
        tagVariantStyles[variant],
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className,
      )}
    >
      {children}
      {closable && (
        <button
          onClick={onClose}
          className="ml-1 hover:opacity-70 transition-opacity"
        >
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
