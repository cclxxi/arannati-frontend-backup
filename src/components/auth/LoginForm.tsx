"use client";

// import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, Input, Alert /*, Space*/ } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useLogin } from "@/hooks";
import { loginSchema, type LoginInput } from "@/lib/utils/validation";
import { APP_ROUTES } from "@/lib/constants";
import toast from "react-hot-toast";

export function LoginForm() {
  // const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isLoading, error } = useLogin();

  const {
    // register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      login(data);
      reset();
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Ошибка входа в систему");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Form
        layout="vertical"
        onFinish={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {error && (
          <Alert
            message="Ошибка входа"
            description={error.message || "Неверные учетные данные"}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

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
                type="email"
                placeholder="Введите ваш email"
                prefix={<UserOutlined className="text-gray-400" />}
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
                placeholder="Введите ваш пароль"
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
            {isLoading || isSubmitting ? "Вход..." : "Войти"}
          </Button>
        </Form.Item>

        {/* Navigation buttons */}
        <div className="mt-4 space-y-3">
          <div className="text-center">
            <Link
              href={APP_ROUTES.auth.forgotPassword}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Забыли пароль?
            </Link>
          </div>
          <div className="text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Еще нет аккаунта?{" "}
            </span>
            <Link
              href={APP_ROUTES.auth.register}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </Form>
    </div>
  );
}
