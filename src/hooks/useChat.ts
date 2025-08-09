import { useState, useEffect, useCallback } from "react";
import { wsClient } from "@/lib/api/websocket-native";
import type {
  MessageDTO,
  TypingEvent,
  UserStatusEvent,
  NotificationEvent,
} from "@/lib/api/websocket";
import { useAuthStore } from "@/stores";
import toast from "react-hot-toast";

export interface ChatState {
  messages: MessageDTO[];
  typingUsers: Set<number>;
  onlineUsers: Set<number>;
  isConnected: boolean;
  isAuthenticated: boolean;
}

export interface ChatActions {
  sendMessage: (
    recipientId: number | null,
    content: string,
    chatId?: string,
  ) => void;
  sendSupportMessage: (content: string) => void;
  claimSupport: (userId: number, initialMessage: string) => void;
  markAsRead: (chatId: string, senderId?: number) => void;
  setTyping: (chatId: string, recipientId: number, isTyping: boolean) => void;
  sendBroadcast: (target: string, title: string, message: string) => void;
}

export function useChat(): [ChatState, ChatActions] {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;

    // Connect to WebSocket
    wsClient.connect();

    // Check connection status
    const statusInterval = setInterval(() => {
      setIsConnected(wsClient.isConnected());
      setIsAuthenticated(wsClient.isAuth());
    }, 1000);

    return () => {
      clearInterval(statusInterval);
    };
  }, [user]);

  // Subscribe to WebSocket events
  useEffect(() => {
    // Message handler
    const unsubMessage = wsClient.onMessage((message) => {
      setMessages((prev) => {
        // Avoid duplicates
        const exists = prev.some((m) => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
    });

    // Typing handler
    const unsubTyping = wsClient.onTyping((event: TypingEvent) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (event.isTyping) {
          newSet.add(event.userId);
        } else {
          newSet.delete(event.userId);
        }
        return newSet;
      });
    });

    // User status handler
    const unsubStatus = wsClient.onUserStatus((event: UserStatusEvent) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (event.status === "online") {
          newSet.add(event.userId);
        } else {
          newSet.delete(event.userId);
        }
        return newSet;
      });
    });

    // Notification handler
    const unsubNotification = wsClient.onNotification(
      (notification: NotificationEvent) => {
        // Additional notification handling if needed
        console.log("Notification received:", notification);
      },
    );

    return () => {
      unsubMessage();
      unsubTyping();
      unsubStatus();
      unsubNotification();
    };
  }, []);

  // Actions
  const sendMessage = useCallback(
    (recipientId: number | null, content: string, chatId?: string) => {
      if (!content.trim()) {
        toast.error("Сообщение не может быть пустым");
        return;
      }

      if (!isConnected || !isAuthenticated) {
        toast.error("Нет подключения к серверу");
        return;
      }

      wsClient.sendMessage(recipientId, content, chatId);
    },
    [isConnected, isAuthenticated],
  );

  const sendSupportMessage = useCallback(
    (content: string) => {
      sendMessage(null, content);
    },
    [sendMessage],
  );

  const claimSupport = useCallback(
    (userId: number, initialMessage: string) => {
      if (!isConnected || !isAuthenticated) {
        toast.error("Нет подключения к серверу");
        return;
      }

      wsClient.claimSupportRequest(userId, initialMessage);
    },
    [isConnected, isAuthenticated],
  );

  const markAsRead = useCallback(
    (chatId: string) => {
      if (!isConnected || !isAuthenticated) return;
      wsClient.markMessageAsRead(chatId);
    },
    [isConnected, isAuthenticated],
  );

  const setTyping = useCallback(
    (chatId: string, recipientId: number, isTyping: boolean) => {
      if (!isConnected || !isAuthenticated) return;
      wsClient.sendTypingStatus(chatId, recipientId, isTyping);
    },
    [isConnected, isAuthenticated],
  );

  const sendBroadcast = useCallback(
    (target: string, title: string, message: string) => {
      if (!isConnected || !isAuthenticated) {
        toast.error("Нет подключения к серверу");
        return;
      }

      if (user?.role !== "ADMIN") {
        toast.error("Только администраторы могут отправлять рассылки");
        return;
      }

      wsClient.sendBroadcast({
        target: target as "all" | "users" | "cosmetologists",
        title,
        message,
      });
    },
    [isConnected, isAuthenticated, user?.role],
  );

  return [
    {
      messages,
      typingUsers,
      onlineUsers,
      isConnected,
      isAuthenticated,
    },
    {
      sendMessage,
      sendSupportMessage,
      claimSupport,
      markAsRead,
      setTyping,
      sendBroadcast,
    },
  ];
}

// Hook for typing indicator with debounce
export function useTypingIndicator(
  chatId: string,
  recipientId: number,
  delay: number = 1000,
): (isTyping: boolean) => void {
  const [, { setTyping }] = useChat();
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }

      if (isTyping) {
        // Send typing started
        setTyping(chatId, recipientId, true);

        // Set timeout to stop typing
        const timeout = setTimeout(() => {
          setTyping(chatId, recipientId, false);
        }, delay);

        setTypingTimeout(timeout);
      } else {
        // Send typing stopped
        setTyping(chatId, recipientId, false);
      }
    },
    [chatId, recipientId, delay, setTyping, typingTimeout],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTyping(chatId, recipientId, false);
      }
    };
  }, [typingTimeout, chatId, recipientId, setTyping]);

  return handleTyping;
}
