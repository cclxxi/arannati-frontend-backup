import { io, type Socket } from "socket.io-client";
import { config } from "@/lib/config";
import { auth } from "./client";
/*import type { MessageDTO } from '@/types/api';*/

// События WebSocket
export enum SocketEvents {
  // Подключение
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  ERROR = "error",

  // Аутентификация
  AUTHENTICATE = "authenticate",
  AUTHENTICATED = "authenticated",

  // Сообщения
  MESSAGE_NEW = "message:new",
  MESSAGE_READ = "message:read",
  MESSAGE_TYPING = "message:typing",

  // Уведомления
  NOTIFICATION_NEW = "notification:new",
  NOTIFICATION_READ = "notification:read",

  // Статусы пользователей
  USER_ONLINE = "user:online",
  USER_OFFLINE = "user:offline",
  USER_STATUS = "user:status",

  // Заказы (для real-time обновлений)
  ORDER_STATUS_UPDATE = "order:status:update",
}

// Типы для событий
export interface TypingEvent {
  chatId: string;
  userId: number;
  isTyping: boolean;
}

export interface UserStatusEvent {
  userId: number;
  status: "online" | "offline" | "away";
  lastSeen?: string;
}

export interface NotificationEvent {
  id: number;
  type: "order" | "message" | "system";
  title: string;
  message: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

// Класс для управления WebSocket соединением
class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Подключение к серверу
  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const tokens = auth.getTokens();
    if (!tokens?.accessToken) {
      console.warn("Нет токена для WebSocket подключения");
      return;
    }

    this.socket = io(config.api.wsUrl, {
      transports: ["websocket"],
      auth: {
        token: tokens.accessToken,
      },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
  }

  // Отключение от сервера
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Проверка подключения
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Отправка события
  emit<T = unknown>(event: string, data?: T): void {
    if (!this.socket?.connected) {
      console.warn("WebSocket не подключен");
      return;
    }

    this.socket.emit(event, data);
  }

  // Подписка на событие
  on<T = unknown>(event: string, handler: (data: T) => void): void {
    if (!this.socket) {
      console.warn("WebSocket не инициализирован");
      return;
    }

    this.socket.on(event, handler);
  }

  // Отписка от события
  off(event: string, handler?: (...args: unknown[]) => void): void {
    if (!this.socket) {
      return;
    }

    if (handler) {
      this.socket.off(event, handler);
    } else {
      this.socket.off(event);
    }
  }

  // Отправка сообщения
  sendMessage(chatId: string, content: string): void {
    this.emit(SocketEvents.MESSAGE_NEW, { chatId, content });
  }

  // Отметка сообщения как прочитанного
  markMessageAsRead(messageId: number): void {
    this.emit(SocketEvents.MESSAGE_READ, { messageId });
  }

  // Индикатор набора текста
  sendTypingStatus(chatId: string, isTyping: boolean): void {
    this.emit(SocketEvents.MESSAGE_TYPING, { chatId, isTyping });
  }

  // Настройка обработчиков событий
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Подключение
    this.socket.on(SocketEvents.CONNECT, () => {
      console.log("WebSocket подключен");
      this.reconnectAttempts = 0;

      // Аутентификация после подключения
      const tokens = auth.getTokens();
      if (tokens?.accessToken) {
        this.emit(SocketEvents.AUTHENTICATE, { token: tokens.accessToken });
      }
    });

    // Успешная аутентификация
    this.socket.on(SocketEvents.AUTHENTICATED, (data: { userId: number }) => {
      console.log("WebSocket аутентифицирован", data);
    });

    // Отключение
    this.socket.on(SocketEvents.DISCONNECT, (reason: string) => {
      console.log("WebSocket отключен:", reason);

      if (reason === "io server disconnect") {
        // Сервер принудительно отключил, переподключаемся
        setTimeout(() => this.connect(), this.reconnectDelay);
      }
    });

    // Ошибки
    this.socket.on(SocketEvents.ERROR, (error: Error) => {
      console.error("WebSocket ошибка:", error);
    });

    // Ошибка подключения
    this.socket.on("connect_error", (error: Error) => {
      console.error("Ошибка подключения WebSocket:", error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Превышено количество попыток переподключения");
        this.disconnect();
      }
    });
  }
}

// Экспортируем singleton instance
export const wsClient = new WebSocketClient();

// Hook для использования в React компонентах
export function useWebSocket() {
  return wsClient;
}
