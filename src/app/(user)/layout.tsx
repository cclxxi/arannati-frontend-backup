import type { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard";
import React from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | Личный кабинет | Arannati",
    default: "Личный кабинет",
  },
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
