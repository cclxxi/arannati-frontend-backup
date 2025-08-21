// src/components/common/AuthRequiredModal.tsx
"use client";

import React from "react";
import { Modal } from "antd";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";

interface AuthRequiredModalProps {
  visible: boolean;
  onCloseAction: () => void;
  title?: string;
  description?: string;
}

export default function AuthRequiredModal({
  visible,
  onCloseAction,
  title = "Требуется авторизация",
  description = "Для выполнения этого действия необходимо войти в систему или зарегистрироваться",
}: AuthRequiredModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    onCloseAction();
    router.push("/login");
  };

  const handleRegister = () => {
    onCloseAction();
    router.push("/register");
  };

  return (
    <Modal
      open={visible}
      onCancel={onCloseAction}
      footer={null}
      centered
      width={400}
      className="auth-required-modal"
    >
      <div className="text-center py-4">
        <div className="mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-mint to-forest rounded-full mx-auto flex items-center justify-center">
            <LogIn className="w-10 h-10 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-forest dark:text-beige-light mb-2">
          {title}
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>

        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full px-6 py-3 bg-gradient-to-r from-mint to-forest text-white rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Войти
          </button>

          <button
            onClick={handleRegister}
            className="w-full px-6 py-3 border-2 border-forest dark:border-beige-light text-forest dark:text-beige-light rounded-full hover:bg-forest/10 dark:hover:bg-beige-light/10 transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Зарегистрироваться
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          После входа вы сможете добавлять товары в корзину и избранное
        </p>
      </div>
    </Modal>
  );
}
