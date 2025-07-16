"use client";

import {
  Package,
  Search,
  ShoppingCart,
  Heart,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/utils/common";
import React from "react";

export interface EmptyStateProps {
  type?:
    | "default"
    | "search"
    | "cart"
    | "wishlist"
    | "orders"
    | "messages"
    | "custom";
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

const typeConfig = {
  default: {
    icon: <Package size={64} />,
    title: "Нет данных",
    description: "Здесь пока ничего нет",
  },
  search: {
    icon: <Search size={64} />,
    title: "Ничего не найдено",
    description: "Попробуйте изменить параметры поиска",
  },
  cart: {
    icon: <ShoppingCart size={64} />,
    title: "Корзина пуста",
    description: "Добавьте товары в корзину для оформления заказа",
  },
  wishlist: {
    icon: <Heart size={64} />,
    title: "Список желаний пуст",
    description: "Добавляйте понравившиеся товары в избранное",
  },
  orders: {
    icon: <FileText size={64} />,
    title: "Нет заказов",
    description: "Вы еще не совершали покупок",
  },
  messages: {
    icon: <MessageSquare size={64} />,
    title: "Нет сообщений",
    description: "Начните диалог, чтобы получить помощь",
  },
  custom: {
    icon: null,
    title: "",
    description: "",
  },
};

export function EmptyState({
  type = "default",
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  const config = typeConfig[type];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4",
        className,
      )}
    >
      <div className="text-gray-400 dark:text-gray-600 mb-4">
        {icon || config.icon}
      </div>

      <h3 className="text-xl font-medium text-text-primary mb-2">
        {title || config.title}
      </h3>

      <p className="text-text-secondary text-center mb-6 max-w-md">
        {description || config.description}
      </p>

      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
