"use client";

import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { AuthLayout, RegisterForm } from "@/components/auth";

export default function RegisterPageClient() {
  useAuthRedirect({ redirectIfAuthenticated: true });

  return (
    <AuthLayout
      title="Создать аккаунт"
      subtitle="Присоединяйтесь к тысячам довольных клиентов"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
