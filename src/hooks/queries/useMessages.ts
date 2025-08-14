import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesApi /*, type SendMessageInput*/ } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/keys";
import { showSuccess } from "@/utils/error";
import { wsClient, SocketEvents } from "@/lib/api/websocket-native";
import { useEffect } from "react";
import type { MessageDTO /*, ChatDTO*/ } from "@/types/api";

// Hook для получения списка чатов
export function useChats() {
  const queryClient = useQueryClient();

  // Подписка на новые сообщения через WebSocket
  useEffect(() => {
    const handleNewMessage = async () => {
      // Инвалидируем список чатов для обновления последнего сообщения
      await queryClient.invalidateQueries({
        queryKey: queryKeys.messages.chats(),
      });

      // Обновляем счетчик непрочитанных
      await queryClient.invalidateQueries({
        queryKey: queryKeys.messages.unread(),
      });
    };

    wsClient.on(SocketEvents.MESSAGE_NEW, handleNewMessage);

    return () => {
      wsClient.off(SocketEvents.MESSAGE_NEW, handleNewMessage);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: queryKeys.messages.chats(),
    queryFn: messagesApi.getChats,
    refetchInterval: 30000, // Обновляем каждые 30 секунд
  });
}

// Hook для получения сообщений в чате
export function useChatMessages(chatId: string, enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !chatId) return;

    const handleNewMessage = (...args: unknown[]) => {
      const message = args[0] as MessageDTO;
      // Добавляем новое сообщение в кеш
      queryClient.setQueryData<MessageDTO[]>(
        queryKeys.messages.chat(chatId),
        (oldData = []) => [...oldData, message],
      );
    };

    // Подписываемся на новые сообщения для этого чата
    wsClient.on(`${SocketEvents.MESSAGE_NEW}:${chatId}`, handleNewMessage);

    return () => {
      wsClient.off(`${SocketEvents.MESSAGE_NEW}:${chatId}`, handleNewMessage);
    };
  }, [chatId, enabled, queryClient]);

  return useQuery({
    queryKey: queryKeys.messages.chat(chatId),
    queryFn: () => messagesApi.getChatMessages(chatId),
    enabled: enabled && !!chatId,
    refetchInterval: false, // Не обновляем автоматически, используем WebSocket
  });
}

// Hook для отправки сообщения
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: messagesApi.sendMessage,
    onMutate: async (data) => {
      // Создаем оптимистичное сообщение
      const optimisticMessage: Partial<MessageDTO> = {
        content: data.content,
        recipientId: data.recipientId,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      // Находим или создаем чат
      const chatId = await messagesApi.getOrCreateChat(data.recipientId);

      // Добавляем сообщение в кеш
      queryClient.setQueryData<MessageDTO[]>(
        queryKeys.messages.chat(chatId),
        (oldData = []) => [...oldData, optimisticMessage as MessageDTO],
      );

      return { chatId };
    },
    onSuccess: async (_, __, context) => {
      if (context?.chatId) {
        // Инвалидируем чат для обновления
        await queryClient.invalidateQueries({
          queryKey: queryKeys.messages.chat(context.chatId),
        });
      }

      // Инвалидируем список чатов
      await queryClient.invalidateQueries({
        queryKey: queryKeys.messages.chats(),
      });
    },
  });
}

// Hook для отправки запроса в поддержку
export function useSendSupportRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: messagesApi.sendSupportRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.messages.chats(),
      });
      showSuccess("Ваш запрос отправлен в службу поддержки");
    },
  });
}

// Hook для отметки чата как прочитанного
export function useMarkChatAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: messagesApi.markChatAsRead,
    onSuccess: async (_, chatId) => {
      // Обновляем счетчик непрочитанных
      await queryClient.invalidateQueries({
        queryKey: queryKeys.messages.unread(),
      });

      // Обновляем статус сообщений в чате
      queryClient.setQueryData<MessageDTO[]>(
        queryKeys.messages.chat(chatId),
        (oldData = []) => oldData.map((msg) => ({ ...msg, isRead: true })),
      );
    },
  });
}

// Hook для получения количества непрочитанных сообщений
export function useUnreadMessagesCount() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleMessageRead = async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.messages.unread(),
      });
    };

    wsClient.on(SocketEvents.MESSAGE_READ, handleMessageRead);

    return () => {
      wsClient.off(SocketEvents.MESSAGE_READ, handleMessageRead);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: queryKeys.messages.unread(),
    queryFn: messagesApi.getUnreadCount,
    refetchInterval: 60000, // Обновляем каждую минуту
  });
}

// Hook для индикатора набора текста
export function useTypingIndicator(chatId: string) {
  const sendTyping = (isTyping: boolean) => {
    // Passing null as recipientId as it will be determined on the server side
    // based on the chatId
    wsClient.sendTypingStatus(chatId, null, isTyping);
  };

  return { sendTyping };
}
