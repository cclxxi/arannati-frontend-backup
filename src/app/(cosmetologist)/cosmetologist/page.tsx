"use client";

import Link from "next/link";
import {
  Download,
  BookOpen,
  MessageCircle,
  ShoppingBag,
  Star,
} from "lucide-react";
import { withAuth } from "@/components/auth";
import { PageHeader } from "@/components/dashboard";
import { Card, Button, EmptyState } from "@/components/ui";
import { CosmetologistStatsCards } from "@/components/cosmetologist/CosmetologistStatsCards";
import { USER_ROLES, APP_ROUTES } from "@/constants";
import { cn } from "@/utils/common";

// Мокап данных для демонстрации
const mockStats = {
  totalClients: 156,
  totalOrders: 342,
  totalRevenue: 2456780,
  averageRating: 4.8,
};

const quickLinks = [
  {
    title: "Профессиональный каталог",
    description: "Эксклюзивные товары и цены для косметологов",
    icon: ShoppingBag,
    href: APP_ROUTES.cosmetologist.catalog,
    color: "bg-blue-500",
  },
  {
    title: "Скачать каталоги",
    description: "PDF и Excel каталоги для работы",
    icon: Download,
    href: `${APP_ROUTES.cosmetologist.dashboard}/catalogs`,
    color: "bg-green-500",
  },
  {
    title: "Обучающие материалы",
    description: "Видео, статьи и презентации",
    icon: BookOpen,
    href: APP_ROUTES.cosmetologist.materials,
    color: "bg-purple-500",
  },
  {
    title: "Сообщения клиентов",
    description: "Консультации и вопросы",
    icon: MessageCircle,
    href: `${APP_ROUTES.cosmetologist.dashboard}/messages`,
    color: "bg-pink-500",
  },
];

function CosmetologistDashboard() {
  return (
    <>
      <PageHeader
        title="Панель косметолога"
        subtitle="Управляйте вашей профессиональной деятельностью"
      />

      <div className="space-y-6">
        {/* Статистика */}
        <CosmetologistStatsCards stats={mockStats} />

        {/* Быстрые ссылки */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Быстрый доступ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;

              return (
                <Link key={link.href} href={link.href}>
                  <Card interactive className="h-full">
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={cn(
                          "w-16 h-16 rounded-lg flex items-center justify-center text-white mb-4",
                          link.color,
                        )}
                      >
                        <Icon size={32} />
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {link.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {link.description}
                      </p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Важные уведомления */}
        <Card
          title="Важная информация"
          className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
        >
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 dark:text-purple-400">•</span>
              <span className="text-sm">
                Новая коллекция профессиональной косметики уже доступна в
                каталоге
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 dark:text-purple-400">•</span>
              <span className="text-sm">
                Скидка 15% на все товары бренда &#34;Professional Care&#34; до
                конца месяца
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 dark:text-purple-400">•</span>
              <span className="text-sm">
                Вебинар &#34;Новые техники в косметологии&#34; состоится 25
                числа в 18:00
              </span>
            </li>
          </ul>
        </Card>

        {/* Последние отзывы */}
        <Card
          title="Последние отзывы клиентов"
          extra={
            <Link href={APP_ROUTES.cosmetologist.reviews}>
              <Button type="link">Все отзывы</Button>
            </Link>
          }
        >
          <EmptyState
            type="custom"
            icon={<Star size={48} />}
            title="Отзывов пока нет"
            description="Здесь будут отображаться отзывы ваших клиентов"
          />
        </Card>
      </div>
    </>
  );
}

export default withAuth(CosmetologistDashboard, {
  roles: [USER_ROLES.COSMETOLOGIST],
});
