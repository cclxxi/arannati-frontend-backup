import { QueryClient } from "@tanstack/react-query";
import { showError } from "@/utils/error";

// Создаем QueryClient с настройками
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Время жизни кеша (5 минут)
      staleTime: 5 * 60 * 1000,
      // Время хранения неактивных данных (10 минут)
      gcTime: 10 * 60 * 1000,
      // Повторные попытки при ошибке
      retry: (failureCount, error) => {
        // Не повторяем при 4xx ошибках
        if (error instanceof Error && "statusCode" in error) {
          const statusCode = (error as Error & { statusCode: number })
            .statusCode;
          if (statusCode >= 400 && statusCode < 500) {
            return false;
          }
        }
        // Максимум 3 попытки
        return failureCount < 3;
      },
      // Интервал между попытками
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch при фокусе окна
      refetchOnWindowFocus: false,
      // Refetch при восстановлении соединения
      refetchOnReconnect: "always",
    },
    mutations: {
      // Обработка ошибок мутаций
      onError: (error) => {
        showError(error);
      },
      // Повторные попытки для мутаций отключены
      retry: false,
    },
  },
});
