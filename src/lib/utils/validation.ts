import { z } from "zod";
import { REGEX_PATTERNS } from "@/constants";

// Common validation messages
export const validationMessages = {
  required: "Это поле обязательно для заполнения",
  email: "Введите корректный email адрес",
  phone: "Введите корректный номер телефона",
  password:
    "Пароль должен содержать минимум 6 символов, включая заглавные и строчные буквы, а также цифры",
  passwordMatch: "Пароли не совпадают",
  minLength: (min: number) => `Минимальная длина: ${min} символов`,
  maxLength: (max: number) => `Максимальная длина: ${max} символов`,
  minValue: (min: number) => `Минимальное значение: ${min}`,
  maxValue: (max: number) => `Максимальное значение: ${max}`,
  invalidFormat: "Неверный формат",
  invalidFileType: "Неверный тип файла",
  fileTooLarge: (maxSize: number) =>
    `Размер файла не должен превышать ${maxSize} МБ`,
};

// Common validation schemas
export const emailSchema = z
  .string()
  .min(1, validationMessages.required)
  .email(validationMessages.email);

export const phoneSchema = z
  .string()
  .min(1, validationMessages.required)
  .regex(REGEX_PATTERNS.PHONE, validationMessages.phone);

export const passwordSchema = z
  .string()
  .min(6, validationMessages.minLength(6))
  .regex(REGEX_PATTERNS.PASSWORD, validationMessages.password);

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, validationMessages.required),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, validationMessages.required),
    firstName: z
      .string()
      .min(2, validationMessages.minLength(2))
      .max(50, validationMessages.maxLength(50)),
    lastName: z
      .string()
      .min(2, validationMessages.minLength(2))
      .max(50, validationMessages.maxLength(50)),
    phone: phoneSchema.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: validationMessages.passwordMatch,
    path: ["confirmPassword"],
  });

export const cosmetologistRegisterSchema = registerSchema.extend({
  institutionName: z
    .string()
    .min(1, validationMessages.required)
    .max(255, validationMessages.maxLength(255)),
  graduationYear: z
    .number()
    .min(1990, validationMessages.minValue(1990))
    .max(
      new Date().getFullYear(),
      `Год не может быть больше ${new Date().getFullYear()}`,
    ),
  specialization: z
    .string()
    .max(255, validationMessages.maxLength(255))
    .optional(),
  licenseNumber: z
    .string()
    .max(100, validationMessages.maxLength(100))
    .optional(),
  diplomaFile: z.instanceof(File).optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, validationMessages.required),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: validationMessages.passwordMatch,
    path: ["confirmPassword"],
  });

// Product schemas
export const productSchema = z.object({
  name: z
    .string()
    .min(1, validationMessages.required)
    .max(255, validationMessages.maxLength(255)),
  description: z
    .string()
    .max(5000, validationMessages.maxLength(5000))
    .optional(),
  shortDescription: z
    .string()
    .max(1000, validationMessages.maxLength(1000))
    .optional(),
  sku: z
    .string()
    .min(1, validationMessages.required)
    .max(100, validationMessages.maxLength(100)),
  categoryId: z.number().min(1, validationMessages.required),
  brandId: z.number().min(1, validationMessages.required),
  regularPrice: z.number().min(0, validationMessages.minValue(0)),
  cosmetologistPrice: z
    .number()
    .min(0, validationMessages.minValue(0))
    .optional(),
  salePrice: z.number().min(0, validationMessages.minValue(0)).optional(),
  professional: z.boolean().default(false),
  active: z.boolean().default(true),
  stockQuantity: z.number().min(0, validationMessages.minValue(0)).default(0),
  weight: z.number().min(0, validationMessages.minValue(0)).optional(),
  dimensions: z.string().max(100, validationMessages.maxLength(100)).optional(),
  ingredients: z
    .string()
    .max(5000, validationMessages.maxLength(5000))
    .optional(),
  usageInstructions: z
    .string()
    .max(5000, validationMessages.maxLength(5000))
    .optional(),
  sortOrder: z.number().min(0, validationMessages.minValue(0)).default(0),
});

// Order schemas
export const orderCreateSchema = z.object({
  customerName: z
    .string()
    .min(1, validationMessages.required)
    .max(255, validationMessages.maxLength(255)),
  customerEmail: emailSchema,
  customerPhone: phoneSchema,
  deliveryAddress: z
    .string()
    .min(1, validationMessages.required)
    .max(500, validationMessages.maxLength(500)),
  deliveryMethod: z.enum(["PICKUP", "COURIER", "POST"]),
  paymentMethod: z.enum(["CASH", "CARD", "ONLINE"]),
  notes: z.string().max(1000, validationMessages.maxLength(1000)).optional(),
});

// Review schema
export const reviewSchema = z.object({
  productId: z.number().min(1, validationMessages.required),
  rating: z.number().min(1).max(5),
  comment: z.string().max(5000, validationMessages.maxLength(5000)).optional(),
});

// Message schema
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, validationMessages.required)
    .max(1000, validationMessages.maxLength(1000)),
});

// File validation
export const validateFile = (
  file: File,
  maxSize: number,
  allowedTypes: string[],
): { valid: boolean; error?: string } => {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: validationMessages.fileTooLarge(maxSize / (1024 * 1024)),
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: validationMessages.invalidFileType,
    };
  }

  return { valid: true };
};

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CosmetologistRegisterInput = z.infer<
  typeof cosmetologistRegisterSchema
>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
