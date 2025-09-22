// src/components/auth/RegisterForm.tsx
"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, Input, Button } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
} from "@ant-design/icons";

import { APP_ROUTES } from "@/constants";
import { useRegister } from "@/hooks";
import toast from "react-hot-toast";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// Schema валидации
const registerSchema = z
  .object({
    email: z.email("Некорректный email"),
    password: z
      .string()
      .min(6, "Пароль должен содержать минимум 6 символов")
      .max(50, "Пароль слишком длинный"),
    confirmPassword: z.string(),
    firstName: z
      .string()
      .min(2, "Имя должно содержать минимум 2 символа")
      .max(50, "Имя слишком длинное"),
    lastName: z
      .string()
      .min(2, "Фамилия должна содержать минимум 2 символа")
      .max(50, "Фамилия слишком длинная"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: register, isLoading } = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Отправляем данные для регистрации
      register(data, {
        onSuccess: () => {
          toast.success("Регистрация прошла успешно!");
          router.push(APP_ROUTES.auth.login);
        },
        onError: (error: ApiError) => {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Ошибка при регистрации";
          toast.error(errorMessage);
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Произошла непредвиденная ошибка");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Form
        layout="vertical"
        onFinish={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Имя"
            validateStatus={errors.firstName ? "error" : ""}
            help={errors.firstName?.message}
            required
          >
            <Controller
              control={control}
              name="firstName"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Имя"
                  prefix={<UserOutlined className="text-gray-400" />}
                  size="large"
                  disabled={isLoading || isSubmitting}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Фамилия"
            validateStatus={errors.lastName ? "error" : ""}
            help={errors.lastName?.message}
            required
          >
            <Controller
              control={control}
              name="lastName"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Фамилия"
                  prefix={<UserOutlined className="text-gray-400" />}
                  size="large"
                  disabled={isLoading || isSubmitting}
                />
              )}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Email"
          validateStatus={errors.email ? "error" : ""}
          help={errors.email?.message}
          required
        >
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Email"
                type="email"
                prefix={<MailOutlined className="text-gray-400" />}
                size="large"
                disabled={isLoading || isSubmitting}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Пароль"
          validateStatus={errors.password ? "error" : ""}
          help={errors.password?.message}
          required
        >
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Input.Password
                {...field}
                placeholder="Пароль"
                prefix={<LockOutlined className="text-gray-400" />}
                size="large"
                disabled={isLoading || isSubmitting}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Подтвердите пароль"
          validateStatus={errors.confirmPassword ? "error" : ""}
          help={errors.confirmPassword?.message}
          required
        >
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <Input.Password
                {...field}
                placeholder="Подтвердите пароль"
                prefix={<LockOutlined className="text-gray-400" />}
                size="large"
                disabled={isLoading || isSubmitting}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            )}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading || isSubmitting}
            disabled={isLoading || isSubmitting}
            size="large"
            className="w-full"
          >
            {isLoading || isSubmitting
              ? "Регистрация..."
              : "Зарегистрироваться"}
          </Button>
        </Form.Item>

        {/* Navigation buttons */}
        <div className="mt-4 space-y-3">
          <div className="text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Уже есть аккаунт?{" "}
            </span>
            <Link
              href={APP_ROUTES.auth.login}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Войти
            </Link>
          </div>
          <div className="text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Вы косметолог?{" "}
            </span>
            <Link
              href={APP_ROUTES.auth.registerCosmetologist}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Зарегистрироваться как косметолог
            </Link>
          </div>
        </div>
      </Form>
    </div>
  );
}
