"use client";

import Link from "next/link";
import { ShoppingBag, Heart, ShoppingCart, Package } from "lucide-react";
import { Card } from "@/components/ui";
import { APP_ROUTES } from "@/constants";
import { cn } from "@/utils/common";
import { Badge } from "antd";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import type { CartStore } from "@/stores/useCartStore";
import type { WishlistStore } from "@/stores/useWishlistStore";

export function QuickActions() {
  const cartCount = useCartStore((state: CartStore) => state.getTotalCount());
  const wishlistCount = useWishlistStore((state: WishlistStore) =>
    state.getCount(),
  );

  const actions = [
    {
      title: "Каталог",
      description: "Посмотреть товары",
      icon: ShoppingBag,
      href: APP_ROUTES.catalog,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Корзина",
      description: `${cartCount} товаров`,
      icon: ShoppingCart,
      href: APP_ROUTES.user.cart,
      color: "text-green-600 bg-green-100",
      badge: cartCount,
    },
    {
      title: "Избранное",
      description: `${wishlistCount} товаров`,
      icon: Heart,
      href: APP_ROUTES.user.wishlist,
      color: "text-red-600 bg-red-100",
      badge: wishlistCount,
    },
    {
      title: "Заказы",
      description: "История покупок",
      icon: Package,
      href: APP_ROUTES.user.orders,
      color: "text-purple-600 bg-purple-100",
    },
  ];

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
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-3 relative",
                    action.color,
                  )}
                >
                  {action.badge !== undefined && action.badge > 0 && (
                    <Badge
                      count={action.badge}
                      size="small"
                      className="absolute -top-2 -right-2"
                    />
                  )}
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
