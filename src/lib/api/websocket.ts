import { io, type Socket } from "socket.io-client";
import { config } from "@/lib/config";
import { auth } from "./client";
import toast from "react-hot-toast";

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
  MESSAGE_SENT = "message:sent",
  MESSAGE_READ = "message:read",
  MESSAGE_TYPING = "message:typing",

  // Поддержка
  SUPPORT_NEW = "support:new",
  SUPPORT_CLAIM = "support:claim",
  SUPPORT_CLAIMED = "support:claimed",

  // Уведомления
  NOTIFICATION_NEW = "notification:new",

  // Статусы пользователей
  USER_STATUS = "user:status",

  // Широковещательные сообщения
  BROADCAST_SEND = "broadcast:send",
  BROADCAST_SENT = "broadcast:sent",
}

// Типы для событий
export interface AuthResponse {
  success: boolean;
  userId?: number;
  role?: string;
  error?: string;
}

export interface MessageData {
  recipientId?: number | null;
  content: string;
  chatId?: string;
}

export interface MessageDTO {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  recipientId?: number;
  recipientName?: string;
  chatId: string;
  createdAt: string;
  read: boolean;
  type: "DIRECT" | "SUPPORT" | "BROADCAST";
}

export interface TypingEvent {
  chatId: string;
  userId: number;
  isTyping: boolean;
}

export interface UserStatusEvent {
  userId: number;
  status: "online" | "offline";
}

export interface NotificationEvent {
  type: "broadcast" | "message" | "order" | "system";
  title: string;
  message: string;
  from?: string;
  data?: Record<string, unknown>;
}

export interface BroadcastData {
  target: "all" | "users" | "cosmetologists";
  title: string;
  message: string;
}

// Callback types
type MessageCallback = (message: MessageDTO) => void;
type TypingCallback = (event: TypingEvent) => void;
type StatusCallback = (event: UserStatusEvent) => void;
type NotificationCallback = (event: NotificationEvent) => void;

// Класс для управления WebSocket соединением
class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isAuthenticated = false;

  // Callbacks storage
  private messageCallbacks: Set<MessageCallback> = new Set();
  private typingCallbacks: Set<TypingCallback> = new Set();
  private statusCallbacks: Set<StatusCallback> = new Set();
  private notificationCallbacks: Set<NotificationCallback> = new Set();

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

    // Используем отдельный порт для Socket.IO сервера
    const wsUrl = `${config.api.wsUrl}:9092`;

    this.socket = io(wsUrl, {
      transports: ["websocket", "polling"],
      query: {
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
      this.isAuthenticated = false;
    }
  }

  // Проверка подключения
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Проверка аутентификации
  isAuth(): boolean {
    return this.isAuthenticated && this.isConnected();
  }

  // Отправка события
  private emit<T = unknown>(event: string, data?: T): void {
    if (!this.socket?.connected) {
      toast.error("Нет подключения к серверу");
      return;
    }

    if (!this.isAuthenticated && event !== SocketEvents.AUTHENTICATE) {
      toast.error("Необходима аутентификация");
      return;
    }

    this.socket.emit(event, data);
  }

  // Отправка сообщения
  sendMessage(
    recipientId: number | null,
    content: string,
    chatId?: string,
  ): void {
    const data: MessageData = {
      recipientId,
      content,
      chatId,
    };

    this.emit(SocketEvents.MESSAGE_NEW, data);
  }

  // Отправка в поддержку
  sendSupportMessage(content: string): void {
    this.sendMessage(null, content);
  }

  // Админ забирает запрос поддержки
  claimSupportRequest(userId: number, initialMessage: string): void {
    this.emit(SocketEvents.SUPPORT_CLAIM, {
      userId,
      initialMessage,
    });
  }

  // Отметка сообщения как прочитанного
  markMessageAsRead(chatId: string, senderId?: number): void {
    this.emit(SocketEvents.MESSAGE_READ, { chatId, senderId });
  }

  // Индикатор набора текста
  sendTypingStatus(
    chatId: string,
    recipientId: number,
    isTyping: boolean,
  ): void {
    this.emit(SocketEvents.MESSAGE_TYPING, {
      chatId,
      recipientId,
      typing: isTyping,
    });
  }

  // Отправка широковещательного сообщения (только для админов)
  sendBroadcast(data: BroadcastData): void {
    this.emit(SocketEvents.BROADCAST_SEND, data);
  }

  // Подписка на новые сообщения
  onMessage(callback: MessageCallback): () => void {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  // Подписка на индикатор набора
  onTyping(callback: TypingCallback): () => void {
    this.typingCallbacks.add(callback);
    return () => this.typingCallbacks.delete(callback);
  }

  // Подписка на статусы пользователей
  onUserStatus(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback);
    return () => this.statusCallbacks.delete(callback);
  }

  // Подписка на уведомления
  onNotification(callback: NotificationCallback): () => void {
    this.notificationCallbacks.add(callback);
    return () => this.notificationCallbacks.delete(callback);
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
    this.socket.on(SocketEvents.AUTHENTICATED, (data: AuthResponse) => {
      if (data.success) {
        console.log("WebSocket аутентифицирован", data);
        this.isAuthenticated = true;
        toast.success("Подключение установлено");
      } else {
        console.error("Ошибка аутентификации:", data.error);
        toast.error("Ошибка аутентификации");
        this.disconnect();
      }
    });

    // Отключение
    this.socket.on(SocketEvents.DISCONNECT, (reason: string) => {
      console.log("WebSocket отключен:", reason);
      this.isAuthenticated = false;

      if (reason === "io server disconnect") {
        // Сервер принудительно отключил
        toast.error("Соединение разорвано сервером");
      } else if (reason === "transport close") {
        // Проблемы с сетью
        toast.error("Потеряно соединение с сервером");
      }
    });

    // Ошибки
    this.socket.on(SocketEvents.ERROR, (error: { message: string }) => {
      console.error("WebSocket ошибка:", error);
      toast.error(error.message || "Ошибка соединения");
    });

    // Ошибка подключения
    this.socket.on("connect_error", (error: Error) => {
      console.error("Ошибка подключения WebSocket:", error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Превышено количество попыток переподключения");
        toast.error("Не удалось подключиться к серверу");
        this.disconnect();
      }
    });

    // Новое сообщение
    this.socket.on(SocketEvents.MESSAGE_NEW, (message: MessageDTO) => {
      this.messageCallbacks.forEach((cb) => cb(message));

      // Показываем уведомление
      toast(`${message.senderName}: ${message.content}`, {
        duration: 4000,
        icon: "💬",
      });
    });

    // Подтверждение отправки сообщения
    this.socket.on(SocketEvents.MESSAGE_SENT, (message: MessageDTO) => {
      console.log("Сообщение отправлено:", message);
      this.messageCallbacks.forEach((cb) => cb(message));
    });

    // Сообщение прочитано
    this.socket.on(
      SocketEvents.MESSAGE_READ,
      (data: { chatId: string; readBy: number }) => {
        console.log("Сообщение прочитано:", data);
      },
    );

    // Индикатор набора
    this.socket.on(SocketEvents.MESSAGE_TYPING, (event: TypingEvent) => {
      this.typingCallbacks.forEach((cb) => cb(event));
    });

    // Новый запрос в поддержку (для админов)
    this.socket.on(SocketEvents.SUPPORT_NEW, (message: MessageDTO) => {
      this.messageCallbacks.forEach((cb) => cb(message));

      // Специальное уведомление для админов
      toast.custom(
        `Новый запрос в поддержку от ${message.senderName}: ${message.content}`,
        {
          duration: 0, // Не исчезает автоматически
          icon: "🆘",
        },
      );
    });

    // Запрос поддержки забран
    this.socket.on(
      SocketEvents.SUPPORT_CLAIMED,
      (data: { success: boolean; message?: string }) => {
        if (data.success) {
          toast.success("Вы взяли запрос в обработку");
        } else {
          toast.error(
            data.message || "Запрос уже обрабатывается другим админом",
          );
        }
      },
    );

    // Статус пользователя
    this.socket.on(SocketEvents.USER_STATUS, (event: UserStatusEvent) => {
      this.statusCallbacks.forEach((cb) => cb(event));
    });

    // Уведомления
    this.socket.on(
      SocketEvents.NOTIFICATION_NEW,
      (notification: NotificationEvent) => {
        this.notificationCallbacks.forEach((cb) => cb(notification));

        // Показываем уведомление
        const fromText = notification.from ? ` От: ${notification.from}` : "";
        toast(`${notification.title}: ${notification.message}${fromText}`, {
          duration: 6000,
          icon: "📢",
        });
      },
    );

    // Подтверждение отправки широковещательного сообщения
    this.socket.on(
      SocketEvents.BROADCAST_SENT,
      (data: { success: boolean }) => {
        if (data.success) {
          toast.success("Рассылка отправлена");
        }
      },
    );
  }
}

// Экспортируем singleton instance
export const wsClient = new WebSocketClient();

// Hook для использования в React компонентах
export function useWebSocket() {
  return wsClient;
}
