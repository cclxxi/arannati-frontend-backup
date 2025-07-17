"use client";

import { Suspense } from "react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { AuthLayout, ResetPasswordForm } from "@/components/auth";
import { Spinner } from "@/components/ui";

export default function ResetPasswordPageClient() {
  useAuthRedirect({ redirectIfAuthenticated: true });

  return (
    <Suspense fallback={<Spinner fullScreen />}>
      <AuthLayout title="Новый пароль">
        <ResetPasswordForm />
      </AuthLayout>
    </Suspense>
  );
}
