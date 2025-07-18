"use client";

import Link from "next/link";
import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Eye } from "lucide-react";
import { Button, Card, EmptyState } from "@/components/ui";
import { formatDate, formatPrice, formatOrderStatus } from "@/utils/format";
import { APP_ROUTES } from "@/constants";
import type { OrderDTO } from "@/types/api";

interface RecentOrdersTableProps {
  orders: OrderDTO[];
  loading?: boolean;
  title?: string;
}

const statusColors: Record<string, string> = {
  PENDING: "warning",
  CONFIRMED: "processing",
  PROCESSING: "processing",
  SHIPPED: "blue",
  DELIVERED: "success",
  CANCELLED: "error",
};

export function RecentOrdersTable({
  orders,
  loading = false,
  title = "Последние заказы",
}: RecentOrdersTableProps) {
  const columns: ColumnsType<OrderDTO> = [
    {
      title: "№ Заказа",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (orderNumber: string) => (
        <span className="font-medium">#{orderNumber}</span>
      ),
    },
    {
      title: "Дата",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => formatDate(date),
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status] || "default"}>
          {formatOrderStatus(status)}
        </Tag>
      ),
    },
    {
      title: "Сумма",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => (
        <span className="font-medium">{formatPrice(amount)}</span>
      ),
    },
    {
      title: "Действия",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Link href={`${APP_ROUTES.user.orders}/${record.id}`}>
          <Button type="text" icon={<Eye size={16} />} size="sm">
            Детали
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <Card
      title={title}
      padding="none"
      extra={
        <Link href={APP_ROUTES.user.orders}>
          <Button type="link">Все заказы</Button>
        </Link>
      }
    >
      <Table
        columns={columns}
        dataSource={orders}
        loading={loading}
        pagination={false}
        rowKey="id"
        locale={{
          emptyText: (
            <EmptyState
              type="orders"
              action={{
                label: "Перейти в каталог",
                onClick: () => (window.location.href = APP_ROUTES.catalog),
              }}
            />
          ),
        }}
      />
    </Card>
  );
}
