"use client";

import { useRecentOrders, useOrderStats } from "@/hooks/queries/useOrders";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { Card, Skeleton } from "@/components/ui";
import { ShoppingBag, Package, CheckCircle, DollarSign } from "lucide-react";
import { formatPrice } from "@/utils/format";

export function DashboardClient() {
  const { data: recentOrders = [], isLoading: ordersLoading } =
    useRecentOrders(5);
  const { data: stats, isLoading: statsLoading } = useOrderStats();

  const statCards = [
    {
      title: "Всего заказов",
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "В обработке",
      value: stats?.pendingOrders || 0,
      icon: Package,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Завершено",
      value: stats?.completedOrders || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Общая сумма",
      value: formatPrice(stats?.totalSpent || 0),
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Дашборд</h1>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6">
            {statsLoading ? (
              <Skeleton className="h-20" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Последние заказы */}
      <RecentOrdersTable
        orders={recentOrders}
        loading={ordersLoading}
        title="Последние заказы"
      />
    </div>
  );
}
