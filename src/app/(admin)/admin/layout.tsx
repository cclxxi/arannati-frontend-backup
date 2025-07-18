import type { Metadata } from "next";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import React from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | Админ панель | Arannati",
    default: "Админ панель",
  },
};

export default function AdminRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
