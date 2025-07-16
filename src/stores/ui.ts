import { create } from 'zustand';

interface MobileMenuState {
    isOpen: boolean;
    activeSubmenu: string | null;
}

interface SearchState {
    isOpen: boolean;
    query: string;
    isLoading: boolean;
}

interface AuthModalData {
    mode?: 'login' | 'register' | 'forgot-password';
    redirectUrl?: string;
}

interface ProductPreviewData {
    productId: number;
    variant?: string;
    initialImage?: string;
}

interface ImageGalleryData {
    images: string[];
    initialIndex?: number;
    title?: string;
}

type ModalState =
    | { isOpen: false; type: null; data?: never }
    | { isOpen: true; type: 'auth'; data?: AuthModalData }
    | { isOpen: true; type: 'product-preview'; data: ProductPreviewData }
    | { isOpen: true; type: 'image-gallery'; data: ImageGalleryData };

// Helper type for openModal function
type OpenModalParams =
    | { type: 'auth'; data?: AuthModalData }
    | { type: 'product-preview'; data: ProductPreviewData }
    | { type: 'image-gallery'; data: ImageGalleryData };

export interface UIState {
    // Mobile menu
    mobileMenu: MobileMenuState;
    setMobileMenuOpen: (isOpen: boolean) => void;
    setActiveSubmenu: (submenu: string | null) => void;

    // Search
    search: SearchState;
    setSearchOpen: (isOpen: boolean) => void;
    setSearchQuery: (query: string) => void;
    setSearchLoading: (isLoading: boolean) => void;

    // Modal
    modal: ModalState;
    openModal: <T extends OpenModalParams>(type: T['type'], data?: T['data']) => void;
    closeModal: () => void;

    // Sidebar (для админки и личного кабинета)
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    toggleSidebar: () => void;

    // Loading states
    isPageLoading: boolean;
    setPageLoading: (loading: boolean) => void;

    // Notification badge
    notificationCount: number;
    setNotificationCount: (count: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
    // Mobile menu
    mobileMenu: {
        isOpen: false,
        activeSubmenu: null,
    },
    setMobileMenuOpen: (isOpen) =>
        set(state => ({
            mobileMenu: { ...state.mobileMenu, isOpen }
        })),
    setActiveSubmenu: (submenu) =>
        set(state => ({
            mobileMenu: { ...state.mobileMenu, activeSubmenu: submenu }
        })),

    // Search
    search: {
        isOpen: false,
        query: '',
        isLoading: false,
    },
    setSearchOpen: (isOpen) =>
        set(state => ({
            search: { ...state.search, isOpen }
        })),
    setSearchQuery: (query) =>
        set(state => ({
            search: { ...state.search, query }
        })),
    setSearchLoading: (isLoading) =>
        set(state => ({
            search: { ...state.search, isLoading }
        })),

    // Modal
    modal: {
        isOpen: false,
        type: null,
    },
    openModal: (type, data) =>
        set({
            modal: { isOpen: true, type, data } as ModalState
        }),
    closeModal: () =>
        set({
            modal: { isOpen: false, type: null }
        }),

    // Sidebar
    sidebarCollapsed: false,
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

    // Loading
    isPageLoading: false,
    setPageLoading: (loading) => set({ isPageLoading: loading }),

    // Notifications
    notificationCount: 0,
    setNotificationCount: (count) => set({ notificationCount: count }),
}));