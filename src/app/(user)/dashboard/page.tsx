import { Metadata } from "next";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Дашборд | Arannati Shop",
  description: "Панель управления магазином Arannati",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
