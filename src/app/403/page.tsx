"use client";

import { useRouter } from "next/navigation";
import { ShieldX } from "lucide-react";
import { /*Button,*/ EmptyState } from "@/components/ui";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <EmptyState
        type="custom"
        icon={<ShieldX size={80} className="text-error" />}
        title="Доступ запрещен"
        description="У вас нет прав для просмотра этой страницы. Если вы считаете, что это ошибка, обратитесь к администратору."
        action={{
          label: "Вернуться назад",
          onClick: () => router.back(),
        }}
      />
    </div>
  );
}
