"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft } from "lucide-react";
import { Button, Input, FormItem, FormError, Alert } from "@/components/ui";
import { useForgotPassword } from "@/hooks";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/utils/validation";
import { APP_ROUTES } from "@/constants";

export function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: () => {
        setIsSubmitted(true);
      },
    });
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <Alert
          variant="success"
          message="Проверьте вашу почту"
          description={`Мы отправили инструкции по восстановлению пароля на ${getValues("email")}`}
        />

        <div className="text-center">
          <Link href={APP_ROUTES.auth.login}>
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Вернуться к входу
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Введите email, указанный при регистрации. Мы отправим вам инструкции
          по восстановлению пароля.
        </p>
      </div>

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

      <Button
        htmlType="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={forgotPasswordMutation.isPending}
      >
        Отправить инструкции
      </Button>

      <div className="text-center">
        <Link
          href={APP_ROUTES.auth.login}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Вернуться к входу
        </Link>
      </div>
    </form>
  );
}
