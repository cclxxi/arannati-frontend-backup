"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button, Input, FormItem, FormError, Checkbox } from "@/components/ui";
import { useLogin } from "@/hooks";
import { loginSchema, type LoginInput } from "@/utils/validation";
import { APP_ROUTES } from "@/constants";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginInput) => {
    login.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormItem>
        <Input
          size="lg"
          placeholder="Email"
          type="email"
          autoComplete="email"
          prefix={<Mail className="w-5 h-5 text-gray-400" />}
          error={!!errors.email}
          {...register("email")}
        />
        <FormError error={errors.email?.message} />
      </FormItem>

      <FormItem>
        <Input
          size="lg"
          placeholder="Пароль"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
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
          {...register("password")}
        />
        <FormError error={errors.password?.message} />
      </FormItem>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Запомнить меня
          </span>
        </label>

        <Link
          href={APP_ROUTES.auth.forgotPassword}
          className="text-sm text-primary hover:text-primary-dark transition-colors"
        >
          Забыли пароль?
        </Link>
      </div>

      <Button
        htmlType="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={login.isPending}
        disabled={login.isPending || Object.keys(errors).length > 0}
      >
        Войти
      </Button>

      <div className="text-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Нет аккаунта?{" "}
        </span>
        <Link
          href={APP_ROUTES.auth.register}
          className="text-sm text-primary hover:text-primary-dark transition-colors font-medium"
        >
          Зарегистрироваться
        </Link>
      </div>
    </form>
  );
}
