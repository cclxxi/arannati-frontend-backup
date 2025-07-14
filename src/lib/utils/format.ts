import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

// Форматирование цены для Казахстана
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-KZ', {
    style: 'currency',
    currency: 'KZT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Date formatting
export const formatDate = (date: string | Date, format = 'DD.MM.YYYY'): string => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('DD.MM.YYYY HH:mm');
};

export const formatRelativeTime = (date: string | Date): string => {
  const now = dayjs();
  const target = dayjs(date);
  const diffInHours = now.diff(target, 'hour');

  if (diffInHours < 1) {
    const diffInMinutes = now.diff(target, 'minute');
    if (diffInMinutes < 1) return 'только что';
    return `${diffInMinutes} мин. назад`;
  }

  if (diffInHours < 24) {
    return `${diffInHours} ч. назад`;
  }

  const diffInDays = now.diff(target, 'day');
  if (diffInDays < 7) {
    return `${diffInDays} дн. назад`;
  }

  return formatDate(date);
};

// Форматирование номера телефона для Казахстана
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  // Форматирование для казахстанских номеров
  if (cleaned.startsWith('7') && cleaned.length === 11) {
    const match = cleaned.match(/^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
    }
  }

  // Общий формат для других номеров
  const match = cleaned.match(/^(\d{1,3})(\d{3})(\d{3})(\d{2})(\d{2})$/);
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
  }

  return phone;
};

// Форматирование числа для Казахстана
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ru-KZ').format(num);
};

// Percentage formatting
export const formatPercent = (value: number, decimals = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Б';

  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Pluralize
export const pluralize = (
  count: number,
  one: string,
  two: string,
  many: string,
): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return two;
  return many;
};

// Format order status
export const formatOrderStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    PENDING: 'Ожидает подтверждения',
    CONFIRMED: 'Подтвержден',
    PROCESSING: 'В обработке',
    SHIPPED: 'Отправлен',
    DELIVERED: 'Доставлен',
    CANCELLED: 'Отменен',
  };

  return statusMap[status] ?? status;
};

// Format delivery method
export const formatDeliveryMethod = (method: string): string => {
  const methodMap: Record<string, string> = {
    PICKUP: 'Самовывоз',
    COURIER: 'Курьерская доставка',
    POST: 'Почта России',
  };

  return methodMap[method] ?? method;
};

// Format payment method
export const formatPaymentMethod = (method: string): string => {
  const methodMap: Record<string, string> = {
    CASH: 'Наличными',
    CARD: 'Картой',
    ONLINE: 'Онлайн',
  };

  return methodMap[method] ?? method;
};
