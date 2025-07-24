"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, message, Divider } from "antd";
import {
  User,
  Mail,
  Lock,
  Phone,
  GraduationCap,
  Building,
  Calendar,
  Award,
  Eye,
  EyeOff,
  Upload as UploadIcon,
} from "lucide-react";
import { Button, Input, FormItem, FormError, notify } from "@/components/ui";
import { APP_ROUTES } from "@/constants";
import type { UploadFile, RcFile } from "antd/es/upload";
import { useRegisterCosmetologist } from "@/hooks";

// Define an error type for better type safety
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// Schema валидации
const registrationSchema = z
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
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Некорректный формат телефона"),
    institutionName: z
      .string()
      .min(1, "Введите название учебного заведения")
      .max(255, "Название слишком длинное"),
    graduationYear: z
      .number()
      .min(1990, "Год окончания не может быть раньше 1990")
      .max(
        new Date().getFullYear(),
        `Год окончания не может быть позже ${new Date().getFullYear()}`,
      ),
    specialization: z
      .string()
      .min(1, "Введите специализацию")
      .max(255, "Специализация слишком длинная"),
    licenseNumber: z.string().optional(),
    diplomaFile: z.instanceof(File, { message: "Загрузите диплом" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof registrationSchema>;

export function CosmetologistRegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const { mutate: register, isPending } = useRegisterCosmetologist();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm<FormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      graduationYear: new Date().getFullYear(),
    },
  });

  const onSubmit = (data: FormData) => {
    register(data, {
      onSuccess: () => {
        notify.success(
          "Заявка отправлена! Мы проверим ваши данные и свяжемся с вами.",
        );
        router.push(APP_ROUTES.auth.login);
      },
      onError: (error: ApiError) => {
        notify.error(error.response?.data?.message || "Ошибка при регистрации");
      },
    });
  };

  const isFormDisabled = isPending;

  const uploadProps = {
    maxCount: 1,
    fileList,
    beforeUpload: async (file: RcFile) => {
      const isImage = file.type.startsWith("image/");
      const isPDF = file.type === "application/pdf";

      if (!isImage && !isPDF) {
        message.error("Можно загрузить только изображения или PDF!");
        return false;
      }

      const isLt5M = file.size / 1024 / 1024 < 10;
      if (!isLt5M) {
        message.error("Файл должен быть меньше 10MB!");
        return false;
      }

      setValue("diplomaFile", file);
      clearErrors("diplomaFile");
      setFileList([
        {
          uid: file.uid || "-1",
          name: file.name,
          status: "done" as const,
          originFileObj: file,
        },
      ]);
      return false;
    },
    onRemove: () => {
      setValue("diplomaFile", undefined as unknown as File);
      setFileList([]);
    },
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Личные данные */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Личные данные
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormItem>
              <Controller
                control={control}
                name="firstName"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Имя"
                    prefix={<User className="w-5 h-5 text-gray-400" />}
                    error={!!errors.firstName}
                    disabled={isFormDisabled}
                  />
                )}
              />
              <FormError error={errors.firstName?.message} />
            </FormItem>

            <FormItem>
              <Controller
                control={control}
                name="lastName"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Фамилия"
                    prefix={<User className="w-5 h-5 text-gray-400" />}
                    error={!!errors.lastName}
                    disabled={isFormDisabled}
                  />
                )}
              />
              <FormError error={errors.lastName?.message} />
            </FormItem>
          </div>

          <FormItem>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Email"
                  type="email"
                  autoComplete="email"
                  prefix={<Mail className="w-5 h-5 text-gray-400" />}
                  error={!!errors.email}
                  disabled={isFormDisabled}
                />
              )}
            />
            <FormError error={errors.email?.message} />
          </FormItem>

          <FormItem>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Телефон (+7...)"
                  type="tel"
                  prefix={<Phone className="w-5 h-5 text-gray-400" />}
                  error={!!errors.phone}
                  disabled={isFormDisabled}
                />
              )}
            />
            <FormError error={errors.phone?.message} />
          </FormItem>
        </div>
      </div>

      <Divider />

      {/* Пароль */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Создайте пароль
        </h3>
        <div className="space-y-4">
          <FormItem>
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Пароль"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  prefix={<Lock className="w-5 h-5 text-gray-400" />}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isFormDisabled}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                  error={!!errors.password}
                  disabled={isFormDisabled}
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
                  placeholder="Подтвердите пароль"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  prefix={<Lock className="w-5 h-5 text-gray-400" />}
                  suffix={
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isFormDisabled}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                  error={!!errors.confirmPassword}
                  disabled={isFormDisabled}
                />
              )}
            />
            <FormError error={errors.confirmPassword?.message} />
          </FormItem>
        </div>
      </div>

      <Divider />

      {/* Профессиональные данные */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Профессиональные данные
        </h3>
        <div className="space-y-4">
          <FormItem>
            <Controller
              control={control}
              name="institutionName"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Учебное заведение"
                  prefix={<Building className="w-5 h-5 text-gray-400" />}
                  error={!!errors.institutionName}
                  disabled={isFormDisabled}
                />
              )}
            />
            <FormError error={errors.institutionName?.message} />
          </FormItem>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormItem>
              <Controller
                control={control}
                name="graduationYear"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Год окончания"
                    type="number"
                    min={1990}
                    max={new Date().getFullYear()}
                    prefix={<Calendar className="w-5 h-5 text-gray-400" />}
                    error={!!errors.graduationYear}
                    disabled={isFormDisabled}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                )}
              />
              <FormError error={errors.graduationYear?.message} />
            </FormItem>

            <FormItem>
              <Controller
                control={control}
                name="licenseNumber"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Номер лицензии (опционально)"
                    prefix={<Award className="w-5 h-5 text-gray-400" />}
                    error={!!errors.licenseNumber}
                    disabled={isFormDisabled}
                  />
                )}
              />
              <FormError error={errors.licenseNumber?.message} />
            </FormItem>
          </div>

          <FormItem>
            <Controller
              control={control}
              name="specialization"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Специализация"
                  prefix={<GraduationCap className="w-5 h-5 text-gray-400" />}
                  error={!!errors.specialization}
                  disabled={isFormDisabled}
                />
              )}
            />
            <FormError error={errors.specialization?.message} />
          </FormItem>

          <FormItem>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Диплом или сертификат
            </label>
            <Upload.Dragger {...uploadProps} disabled={isFormDisabled}>
              <p className="ant-upload-drag-icon">
                <UploadIcon className="w-12 h-12 text-gray-400 mx-auto" />
              </p>
              <p className="ant-upload-text">
                Нажмите или перетащите файл для загрузки
              </p>
              <p className="ant-upload-hint">
                Поддерживаются изображения (JPG, PNG) или PDF до 10MB
              </p>
            </Upload.Dragger>
            <FormError error={errors.diplomaFile?.message} />
          </FormItem>
        </div>
      </div>

      <Button
        type="primary"
        htmlType="submit"
        loading={isPending}
        className="w-full h-12 text-base"
        disabled={isFormDisabled}
      >
        Отправить заявку
      </Button>

      <p className="text-center text-sm text-text-secondary">
        Уже есть аккаунт?{" "}
        <Link
          href={APP_ROUTES.auth.login}
          className="text-primary hover:text-primary-dark transition-colors"
        >
          Войти
        </Link>
      </p>
    </form>
  );
}
