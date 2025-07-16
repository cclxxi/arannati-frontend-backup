import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {STORAGE_KEYS} from '@/constants';
import type {CartDTO} from '@/types/api';

interface CartState {
    items: CartDTO[];
    isOpen: boolean;

    // Computed values
    totalItems: number;
    totalQuantity: number;

    // Actions
    setItems: (items: CartDTO[]) => void;
    addItem: (item: CartDTO) => void;
    updateItem: (id: number, quantity: number) => void;
    removeItem: (id: number) => void;
    clearCart: () => void;

    // UI actions
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
}

// Helper function to ensure CartDTO has all required properties
const ensureCartItem = (item: Partial<CartDTO> & { quantity: number }): CartDTO => {
    return {
        id: item.id || 0,
        userId: item.userId || 0,
        productId: item.productId || 0,
        quantity: item.quantity,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
        product: item.product
    };
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            totalItems: 0,
            totalQuantity: 0,

            setItems: (items) => {
                const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
                set({
                    items,
                    totalItems: items.length,
                    totalQuantity
                });
            },

            addItem: (newItem) => {
                const items = get().items;
                const existingIndex = items.findIndex(
                    item => item.productId === newItem.productId
                );

                if (existingIndex >= 0) {
                    // Обновляем количество существующего товара
                    const updatedItems = [...items];
                    const existingItem = updatedItems[existingIndex];

                    if (existingItem) {
                        updatedItems[existingIndex] = ensureCartItem({
                            ...existingItem,
                            quantity: existingItem.quantity + newItem.quantity,
                            updatedAt: new Date().toISOString()
                        });
                        get().setItems(updatedItems);
                    }
                } else {
                    // Добавляем новый товар
                    const cartItem = ensureCartItem(newItem);
                    get().setItems([...items, cartItem]);
                }
            },

            updateItem: (id, quantity) => {
                const items = get().items;
                const updatedItems = items.map(item =>
                    item.id === id
                        ? { ...item, quantity, updatedAt: new Date().toISOString() }
                        : item
                );
                get().setItems(updatedItems);
            },

            removeItem: (id) => {
                const items = get().items;
                const filteredItems = items.filter(item => item.id !== id);
                get().setItems(filteredItems);
            },

            clearCart: () => {
                set({
                    items: [],
                    totalItems: 0,
                    totalQuantity: 0
                });
            },

            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            toggleCart: () => set(state => ({ isOpen: !state.isOpen })),
        }),
        {
            name: STORAGE_KEYS.CART_ID,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ items: state.items }),
        }
    )
);