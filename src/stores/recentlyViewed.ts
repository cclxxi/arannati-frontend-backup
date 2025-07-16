import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS, DEFAULTS } from '@/constants';

interface RecentlyViewedItem {
    productId: number;
    viewedAt: string;
}

interface RecentlyViewedState {
    items: RecentlyViewedItem[];

    // Actions
    addItem: (productId: number) => void;
    removeItem: (productId: number) => void;
    clearItems: () => void;
    getRecentIds: (limit?: number) => number[];
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (productId) => {
                const items = get().items;
                const existingIndex = items.findIndex(item => item.productId === productId);

                // Если товар уже просмотрен, перемещаем его в начало
                if (existingIndex >= 0) {
                    const updatedItems = [...items];
                    updatedItems.splice(existingIndex, 1);
                    updatedItems.unshift({
                        productId,
                        viewedAt: new Date().toISOString(),
                    });
                    set({ items: updatedItems });
                } else {
                    // Добавляем новый товар в начало
                    const newItem: RecentlyViewedItem = {
                        productId,
                        viewedAt: new Date().toISOString(),
                    };

                    const updatedItems = [newItem, ...items];

                    // Ограничиваем количество сохраненных товаров
                    if (updatedItems.length > DEFAULTS.MAX_RECENTLY_VIEWED) {
                        updatedItems.pop();
                    }

                    set({ items: updatedItems });
                }
            },

            removeItem: (productId) => {
                const items = get().items;
                const filteredItems = items.filter(item => item.productId !== productId);
                set({ items: filteredItems });
            },

            clearItems: () => {
                set({ items: [] });
            },

            getRecentIds: (limit) => {
                const items = get().items;
                const limitedItems = limit ? items.slice(0, limit) : items;
                return limitedItems.map(item => item.productId);
            },
        }),
        {
            name: STORAGE_KEYS.RECENTLY_VIEWED,
            storage: createJSONStorage(() => localStorage),
        }
    )
);