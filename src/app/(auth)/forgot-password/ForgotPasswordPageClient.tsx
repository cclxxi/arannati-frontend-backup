"use client";

import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { AuthLayout, ForgotPasswordForm } from "@/components/auth";

export default function ForgotPasswordPageClient() {
  useAuthRedirect({ redirectIfAuthenticated: true });

  return (
    <AuthLayout title="Восстановление пароля">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
