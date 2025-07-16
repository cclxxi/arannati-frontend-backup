import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { UserDTO } from '@/types/api';
import { wsClient } from '@/api/websocket';
import { auth } from '@/lib/api';

interface AuthState {
    user: UserDTO | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    setUser: (user: UserDTO | null) => void;
    setLoading: (loading: boolean) => void;
    login: (user: UserDTO) => void;
    logout: () => void;
    updateUser: (updates: Partial<UserDTO>) => void;
}

export const useAuthStore = create<AuthState>()(
    subscribeWithSelector((set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: true,

        setUser: (user) => {
            set({
                user,
                isAuthenticated: !!user,
                isLoading: false
            });
        },

        setLoading: (loading) => {
            set({ isLoading: loading });
        },

        login: (user) => {
            set({
                user,
                isAuthenticated: true,
                isLoading: false
            });

            // Подключаем WebSocket при входе
            wsClient.connect();
        },

        logout: () => {
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false
            });

            // Отключаем WebSocket при выходе
            wsClient.disconnect();

            // Удаляем токены
            auth.removeTokens();
        },

        updateUser: (updates) => {
            const currentUser = get().user;
            if (currentUser) {
                set({
                    user: { ...currentUser, ...updates }
                });
            }
        },
    }))
);

// Подписка на изменения состояния аутентификации
useAuthStore.subscribe(
    (state) => state.isAuthenticated,
    (isAuthenticated) => {
        if (isAuthenticated) {
            // Дополнительные действия при входе
            console.log('Пользователь авторизован');
        } else {
            // Дополнительные действия при выходе
            console.log('Пользователь вышел из системы');
        }
    }
);