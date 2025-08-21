"use client";

import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { AuthLayout, LoginForm } from "@/components/auth";

export default function LoginPageClient() {
  useAuthRedirect({ redirectIfAuthenticated: true });

  return (
    <AuthLayout title="Вход в аккаунт" subtitle="Введите ваши данные для входа">
      <LoginForm />
    </AuthLayout>
  );
}
