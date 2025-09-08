"use client";

import { DashboardClient } from "./dashboard-client";
import { withAuth } from "@/components/auth/withAuth";

function DashboardPage() {
  return <DashboardClient />;
}

export default withAuth(DashboardPage);
