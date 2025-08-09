import { io, type Socket } from "socket.io-client";
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

// Connection states
type ConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "authenticating"
  | "authenticated";

// Класс для управления WebSocket соединением
class WebSocketClient {
  private socket: Socket | null = null;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isAuthenticated = false;
  private connectionState: ConnectionState = "disconnected";

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
    const wsUrl = "http://localhost:9092";

    console.log("Connecting to WebSocket:", wsUrl);
    this.connectionState = "connecting";

    this.socket = io(wsUrl, {
      transports: ["polling", "websocket"], // Start with polling, then upgrade
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
      this.isAuthenticated = false;
      this.connectionState = "disconnected";
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

  // Получение состояния подключения
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  // Настройка обработчиков событий
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Подключение
    this.socket.on(SocketEvents.CONNECT, () => {
      console.log("WebSocket connected");
      this.connectionState = "connected";
      this.authenticate();
    });

    // Отключение
    this.socket.on(SocketEvents.DISCONNECT, () => {
      console.log("WebSocket disconnected");
      this.connectionState = "disconnected";
      this.isAuthenticated = false;
    });

    // Ошибка
    this.socket.on(SocketEvents.ERROR, (error) => {
      console.error("WebSocket error:", error);
      toast.error("Ошибка подключения к серверу");
    });

    // Аутентификация завершена
    this.socket.on(SocketEvents.AUTHENTICATED, (response: AuthResponse) => {
      if (response.success) {
        console.log("WebSocket authenticated");
        this.isAuthenticated = true;
        this.connectionState = "authenticated";
      } else {
        console.error("WebSocket authentication failed:", response.error);
        this.isAuthenticated = false;
        this.connectionState = "connected";
      }
    });

    // Новое сообщение
    this.socket.on(SocketEvents.MESSAGE_NEW, (message: MessageDTO) => {
      this.messageCallbacks.forEach((callback) => callback(message));
    });

    // Событие типинга
    this.socket.on(SocketEvents.MESSAGE_TYPING, (event: TypingEvent) => {
      this.typingCallbacks.forEach((callback) => callback(event));
    });

    // Статус пользователя
    this.socket.on(SocketEvents.USER_STATUS, (event: UserStatusEvent) => {
      this.statusCallbacks.forEach((callback) => callback(event));
    });

    // Уведомления
    this.socket.on(
      SocketEvents.NOTIFICATION_NEW,
      (notification: NotificationEvent) => {
        this.notificationCallbacks.forEach((callback) =>
          callback(notification),
        );
      },
    );
  }

  // Аутентификация
  private authenticate(): void {
    const tokens = auth.getTokens();
    if (!tokens?.accessToken) {
      console.error("No access token for authentication");
      return;
    }

    this.connectionState = "authenticating";
    this.emit(SocketEvents.AUTHENTICATE, { token: tokens.accessToken });
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
    this.emit(SocketEvents.MESSAGE_SENT, {
      recipientId,
      content,
      chatId,
    });
  }

  // Отправка сообщения поддержки
  sendSupportMessage(content: string): void {
    this.emit(SocketEvents.SUPPORT_NEW, {
      content,
    });
  }

  // Взять запрос поддержки
  claimSupportRequest(userId: number, initialMessage: string): void {
    this.emit(SocketEvents.SUPPORT_CLAIM, {
      userId,
      initialMessage,
    });
  }

  // Отметить сообщение как прочитанное
  markMessageAsRead(chatId: string, senderId?: number): void {
    this.emit(SocketEvents.MESSAGE_READ, {
      chatId,
      senderId,
    });
  }

  // Отправить статус печатания
  sendTypingStatus(
    chatId: string,
    recipientId: number | null,
    isTyping: boolean,
  ): void {
    this.emit(SocketEvents.MESSAGE_TYPING, {
      chatId,
      recipientId,
      isTyping,
    });
  }

  // Отправить широковещательное сообщение
  sendBroadcast(data: BroadcastData): void {
    this.emit(SocketEvents.BROADCAST_SEND, data);
  }

  // Подписка на сообщения
  onMessage(callback: MessageCallback): () => void {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  // Подписка на события типинга
  onTyping(callback: TypingCallback): () => void {
    this.typingCallbacks.add(callback);
    return () => this.typingCallbacks.delete(callback);
  }

  // Подписка на статус пользователя
  onUserStatus(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback);
    return () => this.statusCallbacks.delete(callback);
  }

  // Подписка на уведомления
  onNotification(callback: NotificationCallback): () => void {
    this.notificationCallbacks.add(callback);
    return () => this.notificationCallbacks.delete(callback);
  }

  // Универсальная подписка на события
  on<T = unknown>(
    event: string,
    callback: (data: T, ...args: unknown[]) => void,
  ): void {
    if (!this.socket) {
      this.connect();
    }

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Отписка от событий
  off<T = unknown>(
    event: string,
    callback: (data: T, ...args: unknown[]) => void,
  ): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

// Экспорт экземпляра клиента
export const wsClient = new WebSocketClient();

// Хук для использования в React компонентах
export function useWebSocket() {
  return wsClient;
}
