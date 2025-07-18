"use client";

import Link from "next/link";
import { Avatar } from "antd";
import { Mail, Phone, Calendar, Edit2 } from "lucide-react";
import { Card, Button, StatusBadge } from "@/components/ui";
import { formatDate } from "@/utils/format";
import { APP_ROUTES } from "@/constants";
import type { UserDTO } from "@/types/api";

interface UserProfileCardProps {
  user: UserDTO;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar size={80} className="bg-primary text-2xl">
            {user.firstName?.charAt(0)}
            {user.lastName?.charAt(0)}
          </Avatar>

          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge
                status={user.verified ? "success" : "pending"}
                text={user.verified ? "Подтвержден" : "Не подтвержден"}
              />
              {user.role === "COSMETOLOGIST" && (
                <StatusBadge status="active" text="Косметолог" />
              )}
            </div>
          </div>
        </div>

        <Link href={APP_ROUTES.user.profile}>
          <Button type="text" icon={<Edit2 size={16} />} size="sm">
            Изменить
          </Button>
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <Mail size={16} />
          <span className="text-sm">{user.email}</span>
        </div>

        {user.phone && (
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <Phone size={16} />
            <span className="text-sm">{user.phone}</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <Calendar size={16} />
          <span className="text-sm">
            Зарегистрирован {formatDate(user.createdAt, "DD MMMM YYYY")}
          </span>
        </div>
      </div>
    </Card>
  );
}
