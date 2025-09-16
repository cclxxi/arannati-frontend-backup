import apiClient from "@/lib/api/client";
import { API_ROUTES } from "@/lib/constants";
import type { MessageDTO, ChatDTO } from "@/types/api";

// Типы для отправки сообщений
export interface SendMessageInput {
  recipientId: number;
  content: string;
}

export interface SendSupportInput {
  content: string;
}

export interface ReplySupportInput {
  originalMessageId: number;
  content: string;
}

export interface DeclineMessageInput {
  cosmetologistId: number;
  reason: string;
}

// API методы для сообщений
export const messagesApi = {
  // Получение списка чатов
  getChats: async (): Promise<ChatDTO[]> => {
    const response = await apiClient.get<ChatDTO[]>(API_ROUTES.messages.chats);
    return response.data;
  },

  // Получение сообщений в чате
  getChatMessages: async (chatId: string): Promise<MessageDTO[]> => {
    const response = await apiClient.get<MessageDTO[]>(
      API_ROUTES.messages.chat(chatId),
    );
    return response.data;
  },

  // Отправка сообщения
  sendMessage: async (data: SendMessageInput): Promise<MessageDTO> => {
    const response = await apiClient.post<MessageDTO>(
      API_ROUTES.messages.send,
      data as unknown as Record<string, unknown>,
    );
    return response.data;
  },

  // Отправка запроса в поддержку
  sendSupportRequest: async (data: SendSupportInput): Promise<MessageDTO> => {
    const response = await apiClient.post<MessageDTO>(
      API_ROUTES.messages.support,
      data as unknown as Record<string, unknown>,
    );
    return response.data;
  },

  // Ответ на запрос поддержки
  replySupportRequest: async (data: ReplySupportInput): Promise<MessageDTO> => {
    const response = await apiClient.post<MessageDTO>(
      API_ROUTES.messages.supportReply,
      data as unknown as Record<string, unknown>,
    );
    return response.data;
  },

  // Отправка сообщения об отказе косметологу
  sendDeclineMessage: async (
    data: DeclineMessageInput,
  ): Promise<MessageDTO> => {
    const response = await apiClient.post<MessageDTO>(
      API_ROUTES.messages.decline,
      data as unknown as Record<string, unknown>,
    );
    return response.data;
  },

  // Отметить чат как прочитанный
  markChatAsRead: async (chatId: string): Promise<void> => {
    await apiClient.post(API_ROUTES.messages.markRead(chatId));
  },

  // Получение количества непрочитанных сообщений
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>(
      API_ROUTES.messages.unreadCount,
    );
    return response.data.count;
  },

  // Поиск чата с пользователем
  findChatWithUser: async (userId: number): Promise<ChatDTO | null> => {
    const chats = await messagesApi.getChats();
    return (
      chats.find((chat) => chat.participants.some((p) => p.id === userId)) ||
      null
    );
  },

  // Создание или получение чата с пользователем
  getOrCreateChat: async (userId: number): Promise<string> => {
    // Сначала ищем существующий чат
    const existingChat = await messagesApi.findChatWithUser(userId);
    if (existingChat) {
      return existingChat.chatId;
    }

    // Если чата нет, отправляем первое сообщение для создания
    /*
        const message = await messagesApi.sendMessage({
            recipientId: userId,
            content: 'Начало диалога',
        });
        */

    // Получаем обновленный список чатов
    const chats = await messagesApi.getChats();
    const newChat = chats.find((chat) =>
      chat.participants.some((p) => p.id === userId),
    );

    if (!newChat) {
      throw new Error("Не удалось создать чат");
    }

    return newChat.chatId;
  },
};
