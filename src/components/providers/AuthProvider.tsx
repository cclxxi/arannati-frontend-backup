'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores';
import { useCurrentUser } from '@/hooks';
import { auth } from '@/lib/api';

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { setUser, setLoading } = useAuthStore();
    const { data: user, isLoading, error } = useCurrentUser();

    useEffect(() => {
        // Проверяем наличие токена при загрузке
        const hasToken = auth.isAuthenticated();

        if (!hasToken) {
            setLoading(false);
            return;
        }

        // Обновляем состояние загрузки
        setLoading(isLoading);

        // Обновляем пользователя при получении данных
        if (user) {
            setUser(user);
        } else if (error) {
            // Если ошибка получения пользователя, очищаем токены
            auth.removeTokens();
            setUser(null);
        }
    }, [user, isLoading, error, setUser, setLoading]);

    return <>{children}</>;
}