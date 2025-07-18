"use client";

import Link from "next/link";
import { ShoppingBag, Heart, MessageCircle, Settings } from "lucide-react";
import { Card } from "@/components/ui";
import { APP_ROUTES } from "@/constants";
import { cn } from "@/utils/common";

const actions = [
  {
    title: "Каталог",
    description: "Посмотреть товары",
    icon: ShoppingBag,
    href: APP_ROUTES.catalog,
    color: "text-blue-600 bg-blue-100",
  },
  {
    title: "Избранное",
    description: "Сохраненные товары",
    icon: Heart,
    href: APP_ROUTES.user.wishlist,
    color: "text-red-600 bg-red-100",
  },
  {
    title: "Сообщения",
    description: "Чат с поддержкой",
    icon: MessageCircle,
    href: APP_ROUTES.user.messages,
    color: "text-green-600 bg-green-100",
  },
  {
    title: "Настройки",
    description: "Управление профилем",
    icon: Settings,
    href: APP_ROUTES.user.profile,
    color: "text-purple-600 bg-purple-100",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Link key={action.href} href={action.href}>
            <Card interactive className="h-full">
              <div className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-3",
                    action.color,
                  )}
                >
                  <Icon size={24} />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
