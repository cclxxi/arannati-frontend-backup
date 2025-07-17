"use client";

import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { AuthLayout, CosmetologistRegisterForm } from "@/components/auth";

export default function CosmetologistRegisterPageClient() {
  useAuthRedirect({ redirectIfAuthenticated: true });

  return (
    <AuthLayout
      title="Регистрация косметолога"
      subtitle="Получите доступ к профессиональным ценам и материалам"
      className="max-w-2xl"
    >
      <CosmetologistRegisterForm />
    </AuthLayout>
  );
}
