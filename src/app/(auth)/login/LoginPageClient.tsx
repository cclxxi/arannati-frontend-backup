"use client";

import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { AuthLayout, LoginForm, SocialLoginButtons } from "@/components/auth";

export default function LoginPageClient() {
  useAuthRedirect({ redirectIfAuthenticated: true });

  return (
    <AuthLayout title="Вход в аккаунт" subtitle="Введите ваши данные для входа">
      <LoginForm />

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
              или продолжите с
            </span>
          </div>
        </div>

        <div className="mt-6">
          <SocialLoginButtons />
        </div>
      </div>
    </AuthLayout>
  );
}
