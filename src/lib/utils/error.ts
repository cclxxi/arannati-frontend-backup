import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

// Error response type from backend
export interface ErrorResponse {
    status: string;
    statusCode: number;
    message: string;
    path?: string;
    timestamp: string;
    errors?: ValidationError[];
}

export interface ValidationError {
    field: string;
    message: string;
}

// Custom error class
export class ApiError extends Error {
  statusCode: number;
  errors?: ValidationError[];

  constructor(message: string, statusCode: number, errors?: ValidationError[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// Extract error message from various error types
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorResponse | undefined;
    if (data?.message) {
      return data.message;
    }

    if (error.response?.status === 401) {
      return 'Необходима авторизация';
    }

    if (error.response?.status === 403) {
      return 'Доступ запрещен';
    }

    if (error.response?.status === 404) {
      return 'Ресурс не найден';
    }

    if (error.response?.status === 500) {
      return 'Внутренняя ошибка сервера';
    }

    return error.message || 'Произошла ошибка при выполнении запроса';
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Неизвестная ошибка';
};

// Extract validation errors
export const getValidationErrors = (error: unknown): ValidationError[] => {
  if (error instanceof ApiError && error.errors) {
    return error.errors;
  }

  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorResponse | undefined;
    if (data?.errors) {
      return data.errors;
    }
  }

  return [];
};

// Show error toast
export const showError = (error: unknown, customMessage?: string): void => {
  const message = customMessage || getErrorMessage(error);
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
  });
};

// Show success toast
export const showSuccess = (message: string): void => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
  });
};

// Show info toast
export const showInfo = (message: string): void => {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    icon: 'ℹ️',
  });
};

// Handle API errors
export const handleApiError = (error: unknown): never => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorResponse | undefined;
    throw new ApiError(
      data?.message || getErrorMessage(error),
      error.response?.status || 500,
      data?.errors,
    );
  }

  throw error;
};

// Check if error is network error
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return !error.response && error.code === 'ERR_NETWORK';
  }
  return false;
};

// Check if error is auth error
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  if (error instanceof ApiError) {
    return error.statusCode === 401;
  }
  return false;
};

// Format validation errors for forms
export const formatValidationErrors = (
  errors: ValidationError[],
): Record<string, string> => {
  return errors.reduce((acc, error) => {
    acc[error.field] = error.message;
    return acc;
  }, {} as Record<string, string>);
};
