"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button, Input, FormItem, FormError, Alert } from "@/components/ui";
import { useResetPassword } from "@/hooks";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/utils/validation";

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const resetPasswordMutation = useResetPassword();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordInput) => {
    if (!token) {
      return;
    }

    resetPasswordMutation.mutate({
      token,
      ...data,
    });
  };

  if (!token) {
    return (
      <Alert
        variant="error"
        message="Неверная ссылка"
        description="Ссылка для восстановления пароля недействительна или устарела. Пожалуйста, запросите новую."
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Введите новый пароль для вашего аккаунта
        </p>
      </div>

      <FormItem>
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <Input
              {...field}
              size="lg"
              placeholder="Новый пароль"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              prefix={<Lock className="w-5 h-5 text-gray-400" />}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
              error={!!errors.password}
            />
          )}
        />
        <FormError error={errors.password?.message} />
      </FormItem>

      <FormItem>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <Input
              {...field}
              size="lg"
              placeholder="Подтвердите пароль"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              prefix={<Lock className="w-5 h-5 text-gray-400" />}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
              error={!!errors.confirmPassword}
            />
          )}
        />
        <FormError error={errors.confirmPassword?.message} />
      </FormItem>

      <Button
        htmlType="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={resetPasswordMutation.isPending}
      >
        Сохранить новый пароль
      </Button>
    </form>
  );
}
