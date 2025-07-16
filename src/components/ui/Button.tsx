"use client";

import { forwardRef } from "react";
import { Button as AntButton, type ButtonProps as AntButtonProps } from "antd";
import { cn } from "@/utils/common";

export interface ButtonProps extends Omit<AntButtonProps, "size" | "variant"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const variantStyles = {
  primary: "bg-primary text-white hover:bg-primary-dark border-primary",
  secondary: "bg-secondary text-white hover:bg-secondary/80 border-secondary",
  outline: "bg-transparent border-primary text-primary hover:bg-primary/10",
  ghost:
    "bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
  link: "bg-transparent border-transparent text-primary hover:text-primary-dark p-0",
  danger: "bg-error text-white hover:bg-error/80 border-error",
};

const sizeStyles = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4",
  lg: "h-12 px-6 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      className,
      ...props
    },
    ref,
  ) => {
    // Маппинг наших размеров на Ant Design размеры
    const antSize =
      size === "sm" ? "small" : size === "lg" ? "large" : "middle";

    // Маппинг вариантов на Ant Design типы
    const getAntType = (): AntButtonProps["type"] => {
      switch (variant) {
        case "primary":
          return "primary";
        case "danger":
          return "primary";
        case "link":
          return "link";
        case "ghost":
          return "text";
        default:
          return "default";
      }
    };

    return (
      <AntButton
        ref={ref}
        type={getAntType()}
        size={antSize}
        className={cn(
          "transition-all duration-200 font-medium",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          variant === "danger" && "ant-btn-dangerous",
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
