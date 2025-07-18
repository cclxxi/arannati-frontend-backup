"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, Input, Alert } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useForgotPassword } from "@/hooks";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/utils/validation";
import toast from "react-hot-toast";

export function ForgotPasswordForm() {
  const { mutate: forgotPassword, isLoading, error } = useForgotPassword();

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      forgotPassword(data);
      toast.success(
        "Инструкции по восстановлению пароля отправлены на ваш email!",
      );
      reset();
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Ошибка при отправке инструкций");
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
            message="Ошибка"
            description={
              error.message || "Произошла ошибка при отправке инструкций"
            }
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
                prefix={<MailOutlined className="text-gray-400" />}
                size="large"
                disabled={isLoading || isSubmitting}
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
            {isLoading || isSubmitting ? "Отправка..." : "Восстановить пароль"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
