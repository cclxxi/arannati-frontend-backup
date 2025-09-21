// src/app/admin/layout.tsx
"use client";

import React from "react";
import { App, ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import { AdminLayout } from "@/components/layouts/AdminLayout";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider locale={ruRU}>
      <App>
        <AdminLayout>{children}</AdminLayout>
      </App>
    </ConfigProvider>
  );
}
