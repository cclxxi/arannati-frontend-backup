"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { Button, Input, FormItem, FormError, Checkbox } from "@/components/ui";
import { useRegister } from "@/hooks";
import { registerSchema, type RegisterInput } from "@/utils/validation";
import { APP_ROUTES } from "@/constants";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterInput) => {
    if (!acceptTerms) {
      return;
    }
    registerMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem>
          <Input
            placeholder="Имя"
            autoComplete="given-name"
            prefix={<User className="w-5 h-5 text-gray-400" />}
            error={!!errors.firstName}
            {...register("firstName")}
          />
          <FormError error={errors.firstName?.message} />
        </FormItem>

        <FormItem>
          <Input
            placeholder="Фамилия"
            autoComplete="family-name"
            prefix={<User className="w-5 h-5 text-gray-400" />}
            error={!!errors.lastName}
            {...register("lastName")}
          />
          <FormError error={errors.lastName?.message} />
        </FormItem>
      </div>

      <FormItem>
        <Input
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
          placeholder="Телефон (необязательно)"
          type="tel"
          autoComplete="tel"
          prefix={<Phone className="w-5 h-5 text-gray-400" />}
          error={!!errors.phone}
          {...register("phone")}
        />
        <FormError error={errors.phone?.message} />
      </FormItem>

      <FormItem>
        <Input
          placeholder="Пароль"
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
          {...register("password")}
        />
        <FormError error={errors.password?.message} />
      </FormItem>

      <FormItem>
        <Input
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
          {...register("confirmPassword")}
        />
        <FormError error={errors.confirmPassword?.message} />
      </FormItem>

      <div className="space-y-4">
        <label className="flex items-start gap-2 cursor-pointer">
          <Checkbox
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Я согласен с{" "}
            <Link href="/#terms" className="text-primary hover:underline">
              условиями использования
            </Link>{" "}
            и{" "}
            <Link href="/#privacy" className="text-primary hover:underline">
              политикой конфиденциальности
            </Link>
          </span>
        </label>

        {!acceptTerms && (
          <p className="text-sm text-error">
            Необходимо принять условия использования
          </p>
        )}
      </div>

      <Button
        htmlType="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={registerMutation.isPending}
        disabled={!acceptTerms}
      >
        Зарегистрироваться
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
            или
          </span>
        </div>
      </div>

      <Link href={APP_ROUTES.auth.registerCosmetologist}>
        <Button htmlType="button" variant="outline" size="lg" fullWidth>
          Регистрация косметолога
        </Button>
      </Link>

      <div className="text-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Уже есть аккаунт?{" "}
        </span>
        <Link
          href={APP_ROUTES.auth.login}
          className="text-sm text-primary hover:text-primary-dark transition-colors font-medium"
        >
          Войти
        </Link>
      </div>
    </form>
  );
}
