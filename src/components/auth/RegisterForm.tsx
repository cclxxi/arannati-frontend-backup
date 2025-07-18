"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, Input, Alert, Space } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useRegister } from "@/hooks";
import { registerSchema, type RegisterInput } from "@/lib/utils/validation";
import toast from "react-hot-toast";

export function RegisterForm() {
  const { mutate: register, isLoading, error } = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      register(data);
      toast.success("Регистрация успешна! Проверьте email для подтверждения.");
      reset();
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Ошибка регистрации");
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
            message="Ошибка регистрации"
            description={error.message || "Произошла ошибка при регистрации"}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        <Space direction="horizontal" className="w-full">
          <Form.Item
            label="Имя"
            validateStatus={errors.firstName ? "error" : ""}
            help={errors.firstName?.message}
            required
            className="flex-1"
          >
            <Controller
              control={control}
              name="firstName"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Ваше имя"
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
            className="flex-1"
          >
            <Controller
              control={control}
              name="lastName"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Ваша фамилия"
                  prefix={<UserOutlined className="text-gray-400" />}
                  size="large"
                  disabled={isLoading || isSubmitting}
                />
              )}
            />
          </Form.Item>
        </Space>

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
                prefix={<MailOutlined className="text-gray-400" />}
                size="large"
                disabled={isLoading || isSubmitting}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Телефон"
          validateStatus={errors.phone ? "error" : ""}
          help={errors.phone?.message}
        >
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Введите ваш телефон"
                prefix={<PhoneOutlined className="text-gray-400" />}
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
                placeholder="Введите пароль"
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
      </Form>
    </div>
  );
}
