"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Upload,
  FileText,
  Award,
  Building,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { Upload as AntUpload } from "antd";
import type { UploadProps } from "antd";
import toast from "react-hot-toast"; // Replace antd message with react-hot-toast
import { Button, Input, FormItem, FormError, Select } from "@/components/ui";
import { useRegisterCosmetologist } from "@/hooks";
import {
  cosmetologistRegisterSchema,
  type CosmetologistRegisterInput,
} from "@/utils/validation";
import { APP_ROUTES } from "@/constants";
import { config } from "@/lib/config";

const currentYear = new Date().getFullYear();
const graduationYears = Array.from(
  { length: currentYear - 1990 + 1 },
  (_, i) => ({
    value: currentYear - i,
    label: String(currentYear - i),
  }),
);

export function CosmetologistRegisterForm() {
  const [diplomaFile, setDiplomaFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const registerMutation = useRegisterCosmetologist();

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CosmetologistRegisterInput>({
    resolver: zodResolver(cosmetologistRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      institutionName: "",
      graduationYear: undefined,
      specialization: "",
      licenseNumber: "",
    },
  });

  const uploadProps: UploadProps = {
    accept: ".pdf,.jpg,.jpeg,.png",
    maxCount: 1,
    beforeUpload: async (file) => {
      // Check file type
      const isValidType = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ].includes(file.type);
      if (!isValidType) {
        toast.error("Можно загружать только PDF, JPG или PNG файлы!");
        return false;
      }

      // Check file size
      const isValidSize = file.size / 1024 / 1024 < config.upload.maxFileSize;
      if (!isValidSize) {
        toast.error(`Файл должен быть меньше ${config.upload.maxFileSize}MB!`);
        return false;
      }

      // Check file name length
      if (file.name.length > 100) {
        toast.error("Имя файла слишком длинное!");
        return false;
      }

      setDiplomaFile(file);
      setValue("diplomaFile", file);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setDiplomaFile(null);
      setValue("diplomaFile", undefined);
    },
  };

  const onSubmit = async (data: CosmetologistRegisterInput) => {
    // Diploma is required for cosmetologist registration
    if (!diplomaFile) {
      toast.error("Необходимо загрузить диплом или сертификат");
      return;
    }

    // Pass the original data object with the file
    const submitData = {
      ...data,
      diplomaFile,
    };

    registerMutation.mutate(submitData, {
      onError: (error: unknown) => {
        console.error("Registration error:", error);
        toast.error("Ошибка при регистрации. Попробуйте еще раз.");
      },
      onSuccess: () => {
        toast.success("Заявка успешно отправлена!");
      },
    });
  };

  const isFormDisabled = isSubmitting || registerMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Для косметологов:</strong> После регистрации ваша заявка будет
          проверена администратором в течение 3 рабочих дней. Вы получите доступ
          к профессиональным ценам и эксклюзивным материалам.
        </p>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Личная информация</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

      {/* Professional Information */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-medium">Профессиональная информация</h3>

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

        <FormItem>
          <Controller
            control={control}
            name="graduationYear"
            render={({ field }) => (
              <Select
                placeholder="Год окончания"
                options={graduationYears}
                value={field.value}
                onChange={field.onChange}
                disabled={isFormDisabled}
                status={errors.graduationYear ? "error" : undefined}
                className={errors.graduationYear ? "border-red-500" : ""}
              />
            )}
          />
          <FormError error={errors.graduationYear?.message} />
        </FormItem>

        <FormItem>
          <Controller
            control={control}
            name="specialization"
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Специализация (необязательно)"
                prefix={<Award className="w-5 h-5 text-gray-400" />}
                error={!!errors.specialization}
                disabled={isFormDisabled}
              />
            )}
          />
          <FormError error={errors.specialization?.message} />
        </FormItem>

        <FormItem>
          <Controller
            control={control}
            name="licenseNumber"
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Номер лицензии (необязательно)"
                prefix={<FileText className="w-5 h-5 text-gray-400" />}
                error={!!errors.licenseNumber}
                disabled={isFormDisabled}
              />
            )}
          />
          <FormError error={errors.licenseNumber?.message} />
        </FormItem>

        <FormItem>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Диплом или сертификат <span className="text-red-500">*</span>
          </label>
          <AntUpload.Dragger
            {...uploadProps}
            disabled={isFormDisabled}
            className={isFormDisabled ? "cursor-not-allowed opacity-50" : ""}
          >
            <p className="ant-upload-drag-icon">
              <Upload className="w-12 h-12 mx-auto text-gray-400" />
            </p>
            <p className="ant-upload-text">
              Нажмите или перетащите файл для загрузки
            </p>
            <p className="ant-upload-hint">
              Поддерживаются форматы PDF, JPG, PNG. Максимальный размер{" "}
              {config.upload.maxFileSize}MB
            </p>
          </AntUpload.Dragger>

          {diplomaFile && (
            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ Файл загружен: {diplomaFile.name}
              </p>
            </div>
          )}

          {!diplomaFile && (
            <p className="mt-2 text-sm text-red-500">
              Загрузка диплома обязательна для регистрации косметолога
            </p>
          )}
        </FormItem>
      </div>

      <Button
        htmlType="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={registerMutation.isPending}
        disabled={isFormDisabled || !diplomaFile}
      >
        {registerMutation.isPending ? "Отправка заявки..." : "Отправить заявку"}
      </Button>

      {/* Error display */}
      {registerMutation.isError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">
            Произошла ошибка при отправке заявки. Пожалуйста, попробуйте еще
            раз.
          </p>
        </div>
      )}

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
