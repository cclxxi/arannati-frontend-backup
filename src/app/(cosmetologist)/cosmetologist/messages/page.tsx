"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Bot, Loader, Wifi, WifiOff } from "lucide-react";
import { useAuthStore } from "@/stores";
import { wsClient } from "@/lib/api/websocket-native";
import type { MessageDTO, TypingEvent } from "@/lib/api/websocket-native";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";
import { motion } from "framer-motion";

dayjs.extend(relativeTime);
dayjs.locale("ru");

export default function CosmetologistMessagesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [connectionState, setConnectionState] =
    useState<string>("disconnected");
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const connectionCheckInterval = useRef<
    ReturnType<typeof setInterval> | undefined
  >(undefined);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check connection status
  const checkConnectionStatus = useCallback(() => {
    const state = wsClient.getConnectionState();
    setConnectionState(state);
  }, []);

  // Subscribe to WebSocket events
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    console.log(
      "Setting up WebSocket subscriptions for Cosmetologist Messages Page",
    );

    // Check connection status periodically
    connectionCheckInterval.current = setInterval(checkConnectionStatus, 2000);

    // Subscribe to messages
    const unsubMessage = wsClient.onMessage((message) => {
      console.log("Cosmetologist messages page received message:", message);

      // Only show support messages in this page or direct messages to/from current user
      if (
        message.message_type === "SUPPORT" ||
        (message.message_type === "DIRECT" &&
          (message.senderId === user.id || message.recipientId === user.id))
      ) {
        setMessages((prev) => {
          // Avoid duplicates
          const exists = prev.some((m) => m.id === message.id);
          if (exists) return prev;

          return [...prev, message];
        });
      }
    });

    // Subscribe to typing events
    const unsubTyping = wsClient.onTyping((event: TypingEvent) => {
      console.log("Typing event:", event);

      if (event.userId === user.id) return; // Don't show our own typing

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

    return () => {
      if (connectionCheckInterval.current) {
        clearInterval(connectionCheckInterval.current);
      }
      unsubMessage();
      unsubTyping();
    };
  }, [isAuthenticated, user, checkConnectionStatus]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!wsClient.isAuth() || !user) return;

    if (!isTyping) {
      setIsTyping(true);
      wsClient.sendTypingStatus("support", null, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      wsClient.sendTypingStatus("support", null, false);
    }, 1000);
  }, [isTyping, user]);

  // Handle send message
  const handleSend = async () => {
    if (!inputValue.trim() || !wsClient.isAuth() || isSending || !user) return;

    setIsSending(true);
    const messageContent = inputValue.trim();
    setInputValue("");

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      wsClient.sendTypingStatus("support", null, false);
    }

    try {
      // Send support message (recipientId = null)
      wsClient.sendSupportMessage(messageContent);

      // Add optimistic update
      const optimisticMessage: MessageDTO = {
        id: Date.now(), // Temporary ID
        content: messageContent,
        senderId: user.id,
        senderName: user.firstName || "You",
        chatId: "support",
        createdAt: new Date().toISOString(),
        read: false,
        message_type: "SUPPORT",
      };

      setMessages((prev) => [...prev, optimisticMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setInputValue(messageContent); // Restore input
    } finally {
      setIsSending(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Connection status indicator
  const getConnectionStatus = () => {
    switch (connectionState) {
      case "authenticated":
        return {
          text: "Online",
          color: "bg-green-400",
          icon: <Wifi size={16} className="text-white" />,
        };
      case "connected":
      case "authenticating":
        return {
          text: "Connecting...",
          color: "bg-yellow-400",
          icon: <Loader size={16} className="animate-spin text-white" />,
        };
      case "connecting":
        return {
          text: "Connecting...",
          color: "bg-blue-400",
          icon: <Loader size={16} className="animate-spin text-white" />,
        };
      default:
        return {
          text: "Offline",
          color: "bg-red-400",
          icon: <WifiOff size={16} className="text-white" />,
        };
    }
  };

  const status = getConnectionStatus();

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">Вам необходимо войти в систему</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bot className="w-10 h-10 text-secondary" />
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 ${status.color} rounded-full border-2 border-white flex items-center justify-center`}
              >
                {status.icon}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Поддержка для косметологов
              </h1>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${status.color}`}
                />
                {status.text}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                Здравствуйте! Как дела с работой?
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Напишите ваш вопрос или сообщение администратору
              </p>
              {connectionState !== "authenticated" && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center justify-center space-x-2 text-yellow-700">
                    <Loader size={18} className="animate-spin" />
                    <p className="text-sm">Подключение к серверу...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.senderId === user.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.senderId === user.id
                      ? "bg-gradient-to-r from-secondary to-secondary/80 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      message.senderId === user.id
                        ? "text-white/70"
                        : "text-gray-500"
                    }`}
                  >
                    {dayjs(message.createdAt).fromNow()}
                  </p>
                </div>
              </motion.div>
            ))
          )}

          {/* Typing indicator */}
          {typingUsers.size > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
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
                  <span className="text-sm text-gray-600">
                    Администратор печатает...
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  handleTyping();
                }}
                onKeyDown={handleKeyPress}
                placeholder={
                  connectionState === "authenticated"
                    ? "Напишите сообщение..."
                    : "Ожидание подключения..."
                }
                disabled={connectionState !== "authenticated" || isSending}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                rows={inputValue.split("\n").length}
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={
                !inputValue.trim() ||
                connectionState !== "authenticated" ||
                isSending
              }
              className="p-3 bg-gradient-to-r from-secondary to-secondary/80 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:shadow-lg"
            >
              {isSending ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Нажмите Enter для отправки сообщения
          </p>
        </div>
      </div>
    </div>
  );
}
