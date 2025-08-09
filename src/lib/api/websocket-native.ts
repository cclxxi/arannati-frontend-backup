import { auth } from "./client";
import toast from "react-hot-toast";

// Re-export all the types that components expect
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

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  message?: MessageDTO;
  title?: string;
  chatId?: string;
  recipientId?: number | null;
  content?: string;
  isTyping?: boolean;
  userId?: number;
  target?: string;
  [key: string]: unknown;
}

export interface OutgoingMessage {
  type: "message" | "typing" | "read" | "support" | "broadcast";
  recipientId?: number | null;
  content?: string;
  chatId?: string;
  isTyping?: boolean;
  userId?: number;
  message?: string;
  target?: string;
  title?: string;
}

export enum SocketEvents {
  // These are for compatibility with existing code
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  ERROR = "error",
  AUTHENTICATE = "authenticate",
  AUTHENTICATED = "authenticated",
  MESSAGE_NEW = "message:new",
  MESSAGE_SENT = "message:sent",
  MESSAGE_READ = "message:read",
  MESSAGE_TYPING = "message:typing",
  SUPPORT_NEW = "support:new",
  SUPPORT_CLAIM = "support:claim",
  SUPPORT_CLAIMED = "support:claimed",
  NOTIFICATION_NEW = "notification:new",
  USER_STATUS = "user:status",
  BROADCAST_SEND = "broadcast:send",
  BROADCAST_SENT = "broadcast:sent",
}

type MessageHandler = (data: WebSocketMessage) => void;
type MessageCallback = (message: MessageDTO) => void;
type TypingCallback = (event: TypingEvent) => void;
type StatusCallback = (event: UserStatusEvent) => void;
type NotificationCallback = (event: NotificationEvent) => void;

class NativeWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers = new Map<string, Set<MessageHandler>>();
  private messageQueue: OutgoingMessage[] = [];
  private isConnecting = false;
  private connectionState = "disconnected";
  private isAuthenticatedFlag = false;

  // Compatibility callbacks for existing code
  private messageCallbacks: Set<MessageCallback> = new Set();
  private typingCallbacks: Set<TypingCallback> = new Set();
  private statusCallbacks: Set<StatusCallback> = new Set();
  private notificationCallbacks: Set<NotificationCallback> = new Set();

  // Update the connect() method with proper URL handling
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    const tokens = auth.getTokens();
    if (!tokens?.accessToken) {
      console.warn("No token for WebSocket connection");
      this.connectionState = "disconnected";
      return;
    }

    this.isConnecting = true;
    this.connectionState = "connecting";

    try {
      // Determine the WebSocket URL based on environment
      let wsUrl: string;

      if (typeof window !== "undefined") {
        // Client-side: use environment variable or determine from current location
        const wsHost = process.env["NEXT_PUBLIC_WS_HOST"];

        if (wsHost) {
          // Use explicit WebSocket host from environment
          const wsProtocol = wsHost.includes("://")
            ? ""
            : window.location.protocol === "https:"
              ? "wss://"
              : "ws://";
          wsUrl = `${wsProtocol}${wsHost}/ws/chat?token=${encodeURIComponent(tokens.accessToken)}`;
        } else {
          // Auto-determine based on current location
          const isSecure = window.location.protocol === "https:";
          const wsProtocol = isSecure ? "wss:" : "ws:";

          // For development, try common WebSocket ports
          const host = window.location.hostname;
          let port = window.location.port;

          if (port === "3000" || !port) {
            port = "8080";
          }

          wsUrl = `${wsProtocol}//${host}:${port}/ws/chat?token=${encodeURIComponent(tokens.accessToken)}`;
        }
      } else {
        // Server-side fallback
        wsUrl = `ws://localhost:8080/ws/chat?token=${encodeURIComponent(tokens.accessToken)}`;
      }

      console.log(
        "Connecting to WebSocket:",
        wsUrl.replace(tokens.accessToken, "[TOKEN]"),
      );

      this.ws = new WebSocket(wsUrl);
      this.setupEventListeners();
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      this.isConnecting = false;
      this.connectionState = "disconnected";
      toast.error("Failed to connect to chat server");

      // Try fallback connection after delay
      setTimeout(() => {
        this.tryFallbackConnection(tokens.accessToken);
      }, 2000);
    }
  }

  private tryFallbackConnection(token: string): void {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    const fallbackPorts = ["8080", "9092", "3001", "8000"];
    const currentHost =
      typeof window !== "undefined" ? window.location.hostname : "localhost";

    // Try each port sequentially
    let portIndex = 0;

    const tryPort = () => {
      if (portIndex >= fallbackPorts.length) {
        console.error("All WebSocket connection attempts failed");
        toast.error(
          "Cannot connect to chat server. Please check if the server is running.",
        );
        this.connectionState = "disconnected";
        return;
      }

      const port = fallbackPorts[portIndex++];
      const wsUrl = `ws://${currentHost}:${port}/ws/chat?token=${encodeURIComponent(token)}`;

      console.log(
        `Trying fallback connection to: ws://${currentHost}:${port}/ws/chat`,
      );

      try {
        this.isConnecting = true;
        this.ws = new WebSocket(wsUrl);

        const connectionTimeout = setTimeout(() => {
          if (this.ws?.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            this.isConnecting = false;
            tryPort(); // Try next port
          }
        }, 3000);

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log(`Successfully connected to WebSocket on port ${port}`);
          this.handleConnectionSuccess();
        };

        this.ws.onerror = () => {
          clearTimeout(connectionTimeout);
          this.isConnecting = false;
          tryPort(); // Try next port
        };

        this.ws.onclose = () => {
          clearTimeout(connectionTimeout);
          this.isConnecting = false;
        };
      } catch (error) {
        console.error(`Failed to connect to port ${port}:`, error);
        this.isConnecting = false;
        tryPort();
      }
    };

    tryPort();
  }

  private handleConnectionSuccess(): void {
    this.isConnecting = false;
    this.connectionState = "authenticated";
    this.isAuthenticatedFlag = true;
    this.reconnectAttempts = 0;
    toast.success("Chat connected successfully");

    this.setupMessageHandlers();

    // Send queued messages
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.handleConnectionSuccess();
    };

    this.ws.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason);
      this.handleDisconnection();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.isConnecting = false;
    };

    this.setupMessageHandlers();
  }

  private setupMessageHandlers(): void {
    if (!this.ws) return;

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        console.log("WebSocket message received:", data);

        // Handle different message types
        const handlers = this.messageHandlers.get(data.type);
        if (handlers) {
          handlers.forEach((handler) => {
            try {
              handler(data);
            } catch (error) {
              console.error("Error in message handler:", error);
            }
          });
        }

        // Handle compatibility callbacks
        switch (data.type) {
          case "message":
          case "messageSent":
            if (data.message) {
              this.messageCallbacks.forEach((cb) => {
                try {
                  cb(data.message!);
                } catch (error) {
                  console.error("Error in message callback:", error);
                }
              });
            }
            break;
          case "typing":
            this.typingCallbacks.forEach((cb) => {
              try {
                cb(data as TypingEvent);
              } catch (error) {
                console.error("Error in typing callback:", error);
              }
            });
            break;
          case "userStatus":
            this.statusCallbacks.forEach((cb) => {
              try {
                cb(data as unknown as UserStatusEvent);
              } catch (error) {
                console.error("Error in status callback:", error);
              }
            });
            break;
          case "notification":
            this.notificationCallbacks.forEach((cb) => {
              try {
                cb(data as unknown as NotificationEvent);
              } catch (error) {
                console.error("Error in notification callback:", error);
              }
            });
            break;
        }

        // Show notifications for certain types
        switch (data.type) {
          case "message":
            if (
              data.message &&
              String(data.message.senderId) !== auth.getCurrentUserId()
            ) {
              toast(`💬 ${data.message.senderName}: ${data.message.content}`, {
                duration: 4000,
              });
            }
            break;
          case "notification":
            if (data.title && data.message) {
              toast(`📢 ${data.title}: ${data.message}`, {
                duration: 6000,
              });
            }
            break;
          case "error":
            if (data.message) {
              toast.error(`Chat error: ${data.message}`);
            }
            break;
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error, event.data);
      }
    };
  }

  private handleDisconnection(): void {
    this.isConnecting = false;
    this.connectionState = "disconnected";
    this.isAuthenticatedFlag = false;
    this.ws = null;

    // Attempt reconnection
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
        30000,
      );
      console.log(
        `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
      );

      setTimeout(() => {
        if (this.connectionState === "disconnected") {
          this.connect();
        }
      }, delay);
    } else {
      toast.error(
        "Chat connection lost. Please refresh the page to reconnect.",
      );
    }
  }

  disconnect(): void {
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
    if (this.ws) {
      this.ws.close(1000, "User disconnected");
      this.ws = null;
    }
    this.messageQueue = [];
    this.connectionState = "disconnected";
    this.isAuthenticatedFlag = false;
  }

  private send(data: OutgoingMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
      } catch (error) {
        console.error("Failed to send WebSocket message:", error);
        toast.error("Failed to send message");
      }
    } else {
      // Queue message if not connected
      this.messageQueue.push(data);
      // Try to connect if not already connecting
      if (!this.isConnecting && this.connectionState === "disconnected") {
        this.connect();
      }
    }
  }

  // Public methods

  sendMessage(
    recipientId: number | null,
    content: string,
    chatId?: string,
  ): void {
    this.send({
      type: "message",
      recipientId,
      content,
      chatId,
    });
  }

  // Compatibility method for support messages
  sendSupportMessage(content: string): void {
    this.sendMessage(null, content);
  }

  sendTypingStatus(
    chatId: string,
    recipientId: number | null,
    isTyping: boolean,
  ): void {
    if (recipientId !== null) {
      this.send({
        type: "typing",
        recipientId,
        isTyping,
        chatId,
      });
    }
  }

  markAsRead(chatId: string): void {
    this.send({
      type: "read",
      chatId,
    });
  }

  // Compatibility method
  markMessageAsRead(chatId: string): void {
    this.markAsRead(chatId);
  }

  // Compatibility method
  claimSupport(userId: number, message: string): void {
    this.send({
      type: "support",
      userId,
      message,
    });
  }

  // Compatibility method
  claimSupportRequest(userId: number, message: string): void {
    this.claimSupport(userId, message);
  }

  sendBroadcast(target: string, title: string, message: string): void;
  sendBroadcast(data: BroadcastData): void;
  sendBroadcast(
    targetOrData: string | BroadcastData,
    title?: string,
    message?: string,
  ): void {
    if (typeof targetOrData === "string") {
      this.send({
        type: "broadcast",
        target: targetOrData,
        title: title!,
        message: message!,
      });
    } else {
      this.send({
        type: "broadcast",
        ...targetOrData,
      });
    }
  }

  // Event subscription

  on(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }

    this.messageHandlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  // Compatibility method
  off(type: string, handler?: MessageHandler): void {
    if (handler) {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.delete(handler);
      }
    } else {
      this.messageHandlers.delete(type);
    }
  }

  // Compatibility methods for specific event types
  onMessage(callback: MessageCallback): () => void {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  onTyping(callback: TypingCallback): () => void {
    this.typingCallbacks.add(callback);
    return () => this.typingCallbacks.delete(callback);
  }

  onUserStatus(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback);
    return () => this.statusCallbacks.delete(callback);
  }

  onNotification(callback: NotificationCallback): () => void {
    this.notificationCallbacks.add(callback);
    return () => this.notificationCallbacks.delete(callback);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Compatibility method
  isAuth(): boolean {
    return this.isAuthenticatedFlag && this.isConnected();
  }

  // Compatibility method
  getConnectionState(): string {
    return this.connectionState;
  }
}

// Export singleton instance
export const wsClient = new NativeWebSocketClient();

// React hook
export function useWebSocket() {
  return wsClient;
}
