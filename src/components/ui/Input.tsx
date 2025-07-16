"use client";

import { forwardRef } from "react";
import {
  Input as AntInput,
  type InputProps as AntInputProps,
  type InputRef,
} from "antd";
import type { TextAreaProps } from "antd/es/input";
import type { TextAreaRef } from "antd/es/input/TextArea";
import { cn } from "@/utils/common";

export interface InputProps extends Omit<AntInputProps, "size"> {
  size?: "sm" | "md" | "lg";
  error?: boolean;
  fullWidth?: boolean;
}

const sizeStyles = {
  sm: "h-8 text-sm",
  md: "h-10",
  lg: "h-12 text-lg",
};

export const Input = forwardRef<InputRef, InputProps>(
  (
    {
      size = "md",
      error = false,
      fullWidth = false,
      className,
      status,
      ...props
    },
    ref,
  ) => {
    const antSize =
      size === "sm" ? "small" : size === "lg" ? "large" : "middle";

    return (
      <AntInput
        ref={ref}
        size={antSize}
        status={error ? "error" : status}
        className={cn(
          "transition-all duration-200",
          sizeStyles[size],
          fullWidth && "w-full",
          error && "border-error focus:border-error",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

// Password Input
export const PasswordInput = forwardRef<InputRef, InputProps>(
  (
    {
      size = "md",
      error = false,
      fullWidth = false,
      className,
      status,
      ...props
    },
    ref,
  ) => {
    const antSize =
      size === "sm" ? "small" : size === "lg" ? "large" : "middle";

    return (
      <AntInput.Password
        ref={ref}
        size={antSize}
        status={error ? "error" : status}
        className={cn(
          "transition-all duration-200",
          sizeStyles[size],
          fullWidth && "w-full",
          error && "border-error focus:border-error",
          className,
        )}
        {...props}
      />
    );
  },
);

PasswordInput.displayName = "PasswordInput";

// Search Input
export const SearchInput = forwardRef<
  InputRef,
  InputProps & { onSearch?: (value: string) => void }
>(
  (
    {
      size = "md",
      error = false,
      fullWidth = false,
      className,
      status,
      onSearch,
      ...props
    },
    ref,
  ) => {
    const antSize =
      size === "sm" ? "small" : size === "lg" ? "large" : "middle";

    return (
      <AntInput.Search
        ref={ref}
        size={antSize}
        status={error ? "error" : status}
        onSearch={onSearch}
        className={cn(
          "transition-all duration-200",
          sizeStyles[size],
          fullWidth && "w-full",
          error && "border-error focus:border-error",
          className,
        )}
        {...props}
      />
    );
  },
);

SearchInput.displayName = "SearchInput";

// TextArea
export const TextArea = forwardRef<
  TextAreaRef,
  InputProps & Omit<TextAreaProps, "size">
>(
  (
    {
      size = "md",
      error = false,
      fullWidth = false,
      className,
      status,
      ...props
    },
    ref,
  ) => {
    return (
      <AntInput.TextArea
        ref={ref}
        status={error ? "error" : status}
        className={cn(
          "transition-all duration-200",
          size === "sm" && "text-sm",
          size === "lg" && "text-lg",
          fullWidth && "w-full",
          error && "border-error focus:border-error",
          className,
        )}
        {...props}
      />
    );
  },
);

TextArea.displayName = "TextArea";
