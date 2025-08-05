"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  Bot,
  Loader,
} from "lucide-react";
import { useAuthStore } from "@/stores";
import { wsClient } from "@/lib/api/websocket";
import type { MessageDTO, TypingEvent } from "@/lib/api/websocket";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";
import { AnimatePresence, motion } from "framer-motion";

dayjs.extend(relativeTime);
dayjs.locale("ru");

interface ChatWidgetProps {
  position?: "bottom-right" | "bottom-left";
}

export default function ChatWidget({
  position = "bottom-right",
}: ChatWidgetProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to WebSocket events
  useEffect(() => {
    if (!isAuthenticated) return;

    // Connect WebSocket
    wsClient.connect();

    // Check connection status
    const checkConnection = setInterval(() => {
      setIsConnected(wsClient.isAuth());
    }, 1000);

    // Subscribe to messages
    const unsubMessage = wsClient.onMessage((message) => {
      // Only show support messages in this widget
      if (
        message.type === "SUPPORT" ||
        (message.type === "DIRECT" &&
          (message.senderId === user?.id || message.recipientId === user?.id))
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Subscribe to typing events
    const unsubTyping = wsClient.onTyping((event: TypingEvent) => {
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
      clearInterval(checkConnection);
      unsubMessage();
      unsubTyping();
    };
  }, [isAuthenticated, user?.id]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      wsClient.sendTypingStatus("support", 0, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      wsClient.sendTypingStatus("support", 0, false);
    }, 1000);
  }, [isTyping]);

  // Handle send message
  const handleSend = async () => {
    if (!inputValue.trim() || !isConnected || isSending) return;

    setIsSending(true);
    const messageContent = inputValue.trim();
    setInputValue("");

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      wsClient.sendTypingStatus("support", 0, false);
    }

    try {
      // Send support message (recipientId = null)
      wsClient.sendSupportMessage(messageContent);

      // Add optimistic update
      const optimisticMessage: MessageDTO = {
        id: Date.now(),
        content: messageContent,
        senderId: user?.id || 0,
        senderName: user?.firstName || "You",
        chatId: "support",
        createdAt: new Date().toISOString(),
        read: false,
        type: "SUPPORT",
      };

      setMessages((prev) => [...prev, optimisticMessage]);
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

  // Position classes
  const positionClasses =
    position === "bottom-right" ? "bottom-4 right-4" : "bottom-4 left-4";

  // Don't render if not authenticated
  if (!isAuthenticated) return null;

  return (
    <>
      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`fixed ${positionClasses} z-50 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden`}
            style={{
              height: isMinimized ? "60px" : "600px",
              maxHeight: "80vh",
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bot className="w-8 h-8" />
                  {isConnected && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">Поддержка Arannati</h3>
                  <p className="text-xs opacity-90">
                    {isConnected ? "Онлайн" : "Подключение..."}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {isMinimized ? (
                    <Maximize2 size={18} />
                  ) : (
                    <Minimize2 size={18} />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                  style={{ height: "calc(100% - 140px)" }}
                >
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <Bot className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Привет! Чем могу помочь?</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Напишите ваш вопрос, и наши специалисты ответят вам
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            message.senderId === user?.id
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderId === user?.id
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
                      className="flex items-center space-x-2 text-gray-500"
                    >
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
                      <span className="text-sm">Специалист печатает...</span>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Напишите сообщение..."
                      disabled={!isConnected || isSending}
                      className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      disabled={!inputValue.trim() || !isConnected || isSending}
                      className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className={`fixed ${positionClasses} z-50 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg flex items-center justify-center`}
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}
    </>
  );
}
