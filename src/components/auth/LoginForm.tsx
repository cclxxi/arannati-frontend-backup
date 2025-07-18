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
import { useLogin } from "@/hooks";
import { loginSchema, type LoginInput } from "@/lib/utils/validation";
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
      toast.success("Успешный вход в систему!");
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
      </Form>
    </div>
  );
}
