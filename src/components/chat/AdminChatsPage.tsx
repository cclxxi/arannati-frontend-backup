"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  User,
  Circle,
  Search,
  MessageSquare,
  MoreVertical,
  Radio,
} from "lucide-react";
import {
  Badge,
  Avatar,
  Dropdown,
  Input,
  Button,
  Modal,
  Select,
  Form,
  Spin,
  Empty,
} from "antd";
import { useWebSocket } from "@/lib/api/websocket-native";
import type { MessageDTO, BroadcastData } from "@/lib/api/websocket-native";
import { useAuthStore } from "@/stores";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import dayjs from "dayjs";

interface Chat {
  id: string;
  userId: number;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  userRole: string;
}

interface BroadcastFormValues {
  target: "all" | "users" | "cosmetologists";
  title: string;
  message: string;
}

export default function AdminChatsPage() {
  const { user } = useAuthStore();
  const ws = useWebSocket();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [supportRequests, setSupportRequests] = useState<MessageDTO[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [form] = Form.useForm();

  // Fetch chats
  const {
    data: chats = [],
    isLoading: chatsLoading,
    refetch: refetchChats,
  } = useQuery({
    queryKey: ["admin-chats"],
    queryFn: async () => {
      const response = await apiClient.get<{ chats: Chat[] }>(
        "/api/messages/chats",
      );
      return response.data.chats || [];
    },
    enabled: user?.role === "ADMIN",
  });

  // Fetch messages for selected chat
  const { data: chatMessages = [] } = useQuery({
    queryKey: ["chat-messages", selectedChat?.id],
    queryFn: async () => {
      if (!selectedChat) return [] as MessageDTO[];
      const response = await apiClient.get<MessageDTO[]>(
        `/api/messages/chat/${selectedChat.id}`,
      );
      return response.data || [];
    },
    enabled: !!selectedChat,
  });

  // WebSocket subscriptions
  useEffect(() => {
    if (!ws.isAuth()) return;

    // Subscribe to new messages
    const unsubMessage = ws.onMessage(async (message) => {
      // Update messages if in current chat
      if (selectedChat && message.chatId === selectedChat.id) {
        setMessages((prev) => [...prev, message]);
      }

      // Update support requests
      if (message.message_type === "SUPPORT" && !message.recipientId) {
        setSupportRequests((prev) => [...prev, message]);
      }

      // Refetch chats to update last message
      await refetchChats();
    });

    // Subscribe to typing events
    const unsubTyping = ws.onTyping((event) => {
      if (event.isTyping) {
        setTypingUsers((prev) => new Set(prev).add(event.userId));
      } else {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(event.userId);
          return newSet;
        });
      }
    });

    // Subscribe to user status
    const unsubStatus = ws.onUserStatus(async () => {
      // Update online status in chats
      await refetchChats();
    });

    return () => {
      unsubMessage();
      unsubTyping();
      unsubStatus();
    };
  }, [ws, selectedChat, refetchChats]);

  // Update messages when chat messages are fetched
  useEffect(() => {
    setMessages(chatMessages);
  }, [chatMessages]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSend = () => {
    if (!inputValue.trim() || !selectedChat) return;

    const content = inputValue.trim();
    setInputValue("");

    ws.sendMessage(selectedChat.userId, content, selectedChat.id);
  };

  // Handle support request claim
  const handleClaimSupport = (request: MessageDTO) => {
    Modal.confirm({
      title: "Взять запрос в обработку?",
      content: `От: ${request.senderName}\n"${request.content}"`,
      okText: "Взять",
      cancelText: "Отмена",
      onOk: () => {
        ws.claimSupportRequest(
          request.senderId,
          "Здравствуйте! Я помогу вам с вашим вопросом.",
        );
        setSupportRequests((prev) => prev.filter((r) => r.id !== request.id));
      },
    });
  };

  // Send broadcast
  const handleBroadcast = (values: BroadcastFormValues) => {
    const data: BroadcastData = {
      target: values.target,
      title: values.title,
      message: values.message,
    };

    ws.sendBroadcast(data);
    setBroadcastModal(false);
    form.resetFields();
  };

  // Filter chats
  const filteredChats = chats.filter(
    (chat: Chat) =>
      chat.userName.toLowerCase().includes(searchValue.toLowerCase()) ||
      chat.userEmail.toLowerCase().includes(searchValue.toLowerCase()),
  );

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Чаты</h2>

          {/* Search */}
          <Input
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            placeholder="Поиск по чатам..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="mb-3"
          />

          {/* Broadcast button */}
          <Button
            type="primary"
            icon={<Radio className="w-4 h-4" />}
            onClick={() => setBroadcastModal(true)}
            className="w-full"
          >
            Массовая рассылка
          </Button>
        </div>

        {/* Support Requests */}
        {supportRequests.length > 0 && (
          <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <h3 className="font-medium text-yellow-800 mb-2">
              Новые запросы ({supportRequests.length})
            </h3>
            {supportRequests.map((request) => (
              <div
                key={request.id}
                className="p-3 bg-white rounded-lg mb-2 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleClaimSupport(request)}
              >
                <div className="font-medium">{request.senderName}</div>
                <div className="text-sm text-gray-600 truncate">
                  {request.content}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {dayjs(request.createdAt).fromNow()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto">
          {chatsLoading ? (
            <div className="flex justify-center items-center h-32">
              <Spin />
            </div>
          ) : filteredChats.length === 0 ? (
            <Empty description="Нет активных чатов" />
          ) : (
            filteredChats.map((chat: Chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedChat?.id === chat.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="relative">
                      <Avatar icon={<User />} />
                      {chat.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium truncate">{chat.userName}</p>
                        <Badge
                          count={
                            chat.userRole === "COSMETOLOGIST"
                              ? "Косметолог"
                              : "Клиент"
                          }
                          style={{
                            backgroundColor:
                              chat.userRole === "COSMETOLOGIST"
                                ? "#8b5cf6"
                                : "#3b82f6",
                            fontSize: "10px",
                            height: "16px",
                            lineHeight: "16px",
                            padding: "0 6px",
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-xs text-gray-400">
                      {dayjs(chat.lastMessageTime).format("HH:mm")}
                    </p>
                    {chat.unreadCount > 0 && <Badge count={chat.unreadCount} />}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar icon={<User />} size="large" />
                  <div>
                    <h3 className="font-semibold">{selectedChat.userName}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedChat.isOnline ? (
                        <span className="flex items-center space-x-1">
                          <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                          <span>В сети</span>
                        </span>
                      ) : (
                        "Не в сети"
                      )}
                    </p>
                  </div>
                </div>
                <Dropdown
                  menu={{
                    items: [
                      { key: "profile", label: "Профиль пользователя" },
                      { key: "history", label: "История заказов" },
                      { key: "block", label: "Заблокировать", danger: true },
                    ],
                  }}
                >
                  <Button icon={<MoreVertical className="w-4 h-4" />} />
                </Dropdown>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${
                    message.senderId === user?.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-2xl ${
                      message.senderId === user?.id
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-800"
                    }`}
                  >
                    <p>{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.senderId === user?.id
                          ? "text-blue-100"
                          : "text-gray-400"
                      }`}
                    >
                      {dayjs(message.createdAt).format("HH:mm")}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {typingUsers.has(selectedChat.userId) && (
                <div className="flex items-center space-x-2 text-gray-500 mb-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                  <span className="text-sm">
                    {selectedChat.userName} печатает...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex items-center space-x-3">
                <Input
                  placeholder="Введите сообщение..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onPressEnter={handleSend}
                  className="flex-1"
                />
                <Button
                  type="primary"
                  icon={<Send className="w-4 h-4" />}
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                >
                  Отправить
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Выберите чат для начала общения</p>
            </div>
          </div>
        )}
      </div>

      {/* Broadcast Modal */}
      <Modal
        title="Массовая рассылка"
        open={broadcastModal}
        onCancel={() => setBroadcastModal(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleBroadcast} layout="vertical">
          <Form.Item
            name="target"
            label="Получатели"
            rules={[{ required: true, message: "Выберите получателей" }]}
          >
            <Select>
              <Select.Option value="all">Все пользователи</Select.Option>
              <Select.Option value="users">Только клиенты</Select.Option>
              <Select.Option value="cosmetologists">
                Только косметологи
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Заголовок"
            rules={[{ required: true, message: "Введите заголовок" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="message"
            label="Сообщение"
            rules={[{ required: true, message: "Введите сообщение" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Отправить рассылку
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
