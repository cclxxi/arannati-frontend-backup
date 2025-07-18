"use client";

import { Package, ShoppingCart, Heart, TrendingUp } from "lucide-react";
import { withAuth } from "@/components/auth";
import {
  PageHeader,
  StatsCard,
  RecentOrdersTable,
  QuickActions,
  UserProfileCard,
} from "@/components/dashboard";
import { Spinner } from "@/components/ui";
import { useAuthStore } from "@/stores";
import {
  useRecentOrders,
  useOrderStats,
  useCartCount,
  useWishlistCount,
} from "@/hooks";
import { formatPrice } from "@/utils/format";

function DashboardPage() {
  const { user } = useAuthStore();
  const { data: recentOrders = [], isLoading: ordersLoading } =
    useRecentOrders(5);
  const { data: orderStats } = useOrderStats();
  const { data: cartCount } = useCartCount();
  const { count: wishlistCount } = useWishlistCount();

  if (!user) return <Spinner fullScreen />;

  return (
    <>
      <PageHeader
        title={`Добро пожаловать, ${user.firstName}!`}
        subtitle="Здесь вы можете управлять заказами и настройками профиля"
      />

      <div className="space-y-6">
        {/* Статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Всего заказов"
            value={orderStats?.totalOrders || 0}
            icon={<Package size={24} />}
            trend={
              orderStats?.totalOrders
                ? { value: 12, isPositive: true }
                : undefined
            }
          />

          <StatsCard
            title="Потрачено"
            value={formatPrice(orderStats?.totalSpent || 0)}
            icon={<TrendingUp size={24} />}
          />

          <StatsCard
            title="В корзине"
            value={cartCount?.totalQuantity || 0}
            subtitle={`${cartCount?.count || 0} товаров`}
            icon={<ShoppingCart size={24} />}
          />

          <StatsCard
            title="В избранном"
            value={wishlistCount}
            icon={<Heart size={24} />}
          />
        </div>

        {/* Профиль и быстрые действия */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <UserProfileCard user={user} />
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Быстрые действия
            </h2>
            <QuickActions />
          </div>
        </div>

        {/* Последние заказы */}
        <RecentOrdersTable orders={recentOrders} loading={ordersLoading} />
      </div>
    </>
  );
}

export default withAuth(DashboardPage);
