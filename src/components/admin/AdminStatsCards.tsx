"use client";

import { Users, ShoppingBag, Package } from "lucide-react";
import { StatsCard } from "@/components/dashboard";
import { formatPrice } from "@/utils/format";

interface AdminStatsCardsProps {
  stats: {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    pendingOrders: number;
    pendingCosmetologists: number;
  };
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Пользователей"
        value={stats.totalUsers}
        icon={<Users size={24} />}
        trend={{ value: 12, isPositive: true }}
        subtitle={`+${stats.pendingCosmetologists} ожидают`}
      />

      <StatsCard
        title="Заказов"
        value={stats.totalOrders}
        icon={<Package size={24} />}
        trend={{ value: 8, isPositive: true }}
        subtitle={`${stats.pendingOrders} в обработке`}
      />

      <StatsCard
        title="Выручка"
        value={formatPrice(stats.totalRevenue)}
        icon={<ShoppingBag size={24} />}
        trend={{ value: 23, isPositive: true }}
      />

      <StatsCard
        title="Товаров"
        value={stats.totalProducts}
        icon={<ShoppingBag size={24} />}
        subtitle="Активных"
      />
    </div>
  );
}
