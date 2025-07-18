"use client";

import { Users, ShoppingBag, Star, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/dashboard";
import { formatPrice } from "@/utils/format";

interface CosmetologistStatsCardsProps {
  stats: {
    totalClients: number;
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
  };
}

export function CosmetologistStatsCards({
  stats,
}: CosmetologistStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Клиентов"
        value={stats.totalClients}
        icon={<Users size={24} />}
        trend={{ value: 15, isPositive: true }}
      />

      <StatsCard
        title="Заказов"
        value={stats.totalOrders}
        icon={<ShoppingBag size={24} />}
        trend={{ value: 8, isPositive: true }}
      />

      <StatsCard
        title="Выручка"
        value={formatPrice(stats.totalRevenue)}
        icon={<TrendingUp size={24} />}
        trend={{ value: 23, isPositive: true }}
      />

      <StatsCard
        title="Рейтинг"
        value={stats.averageRating.toFixed(1)}
        subtitle="из 5.0"
        icon={<Star size={24} />}
      />
    </div>
  );
}
