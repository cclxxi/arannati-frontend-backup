"use client";

import Link from "next/link";
import { Line } from "@ant-design/plots";
import { withAuth } from "@/components/auth";
import { PageHeader } from "@/components/dashboard";
import { Card, Button } from "@/components/ui";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import { USER_ROLES, APP_ROUTES } from "@/constants";

// Мокап данных для демонстрации
const mockStats = {
  totalUsers: 1234,
  totalOrders: 567,
  totalRevenue: 12456780,
  totalProducts: 342,
  pendingOrders: 23,
  pendingCosmetologists: 5,
};

const chartData = [
  { date: "01.01", value: 3200, type: "Выручка" },
  { date: "02.01", value: 4100, type: "Выручка" },
  { date: "03.01", value: 3800, type: "Выручка" },
  { date: "04.01", value: 5200, type: "Выручка" },
  { date: "05.01", value: 4900, type: "Выручка" },
  { date: "06.01", value: 6100, type: "Выручка" },
  { date: "07.01", value: 5800, type: "Выручка" },
  { date: "01.01", value: 12, type: "Заказы" },
  { date: "02.01", value: 18, type: "Заказы" },
  { date: "03.01", value: 15, type: "Заказы" },
  { date: "04.01", value: 24, type: "Заказы" },
  { date: "05.01", value: 20, type: "Заказы" },
  { date: "06.01", value: 28, type: "Заказы" },
  { date: "07.01", value: 25, type: "Заказы" },
];

const chartConfig = {
  data: chartData,
  xField: "date",
  yField: "value",
  seriesField: "type",
  smooth: true,
  animation: {
    appear: {
      animation: "path-in",
      duration: 1000,
    },
  },
  yAxis: [
    {
      title: {
        text: "Выручка (₸)",
      },
    },
    {
      title: {
        text: "Количество заказов",
      },
    },
  ],
};

function AdminDashboard() {
  return (
    <>
      <PageHeader
        title="Панель администратора"
        subtitle="Общая статистика и управление"
      />

      <div className="space-y-6">
        {/* Статистика */}
        <AdminStatsCards stats={mockStats} />

        {/* Быстрые действия */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card
            title="Ожидают подтверждения"
            extra={
              <Link href={APP_ROUTES.admin.cosmetologists}>
                <Button type="link">Посмотреть</Button>
              </Link>
            }
          >
            <div className="space-y-2">
              <p className="text-3xl font-bold text-warning">
                {mockStats.pendingCosmetologists}
              </p>
              <p className="text-sm text-gray-500">
                косметологов ждут проверки
              </p>
            </div>
          </Card>

          <Card
            title="Новые заказы"
            extra={
              <Link href={APP_ROUTES.admin.orders}>
                <Button type="link">Посмотреть</Button>
              </Link>
            }
          >
            <div className="space-y-2">
              <p className="text-3xl font-bold text-info">
                {mockStats.pendingOrders}
              </p>
              <p className="text-sm text-gray-500">заказов требуют обработки</p>
            </div>
          </Card>

          <Card
            title="Низкий остаток"
            extra={
              <Link href={APP_ROUTES.admin.products}>
                <Button type="link">Посмотреть</Button>
              </Link>
            }
          >
            <div className="space-y-2">
              <p className="text-3xl font-bold text-error">12</p>
              <p className="text-sm text-gray-500">товаров заканчиваются</p>
            </div>
          </Card>
        </div>

        {/* График */}
        <Card title="Статистика за неделю">
          <Line {...chartConfig} height={300} />
        </Card>

        {/* Последние события */}
        <Card title="Последние события">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Новый заказ #1234</p>
                <p className="text-sm text-gray-500">
                  Иван Иванов • 2 минуты назад
                </p>
              </div>
              <Button size="sm">Обработать</Button>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Регистрация косметолога</p>
                <p className="text-sm text-gray-500">
                  Мария Петрова • 15 минут назад
                </p>
              </div>
              <Button size="sm">Проверить</Button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Товар закончился</p>
                <p className="text-sm text-gray-500">
                  Крем для лица Pro • 1 час назад
                </p>
              </div>
              <Button size="sm" variant="danger">
                Пополнить
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

export default withAuth(AdminDashboard, {
  roles: [USER_ROLES.ADMIN],
});
