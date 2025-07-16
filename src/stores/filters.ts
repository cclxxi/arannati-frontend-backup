import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { CatalogFilters } from '@/lib/api';

export interface FiltersState extends CatalogFilters {
    // UI state
    isFiltersOpen: boolean;

    // Actions
    setFilter: <K extends keyof CatalogFilters>(
        key: K,
        value: CatalogFilters[K]
    ) => void;
    setFilters: (filters: Partial<CatalogFilters>) => void;
    resetFilters: () => void;
    toggleFiltersPanel: () => void;

    // Computed
    hasActiveFilters: () => boolean;
    getActiveFiltersCount: () => number;
}

const defaultFilters: CatalogFilters = {
    categoryId: undefined,
    brandId: undefined,
    professional: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    search: undefined,
    page: 0,
    size: 24,
    sort: ['sortOrder,asc'],
};

export const useFiltersStore = create<FiltersState>()(
    subscribeWithSelector((set, get) => ({
        ...defaultFilters,
        isFiltersOpen: false,

        setFilter: (key, value) => {
            set({ [key]: value, page: 0 }); // Сбрасываем страницу при изменении фильтров
        },

        setFilters: (filters) => {
            set({ ...filters, page: 0 });
        },

        resetFilters: () => {
            set({ ...defaultFilters, isFiltersOpen: get().isFiltersOpen });
        },

        toggleFiltersPanel: () => {
            set(state => ({ isFiltersOpen: !state.isFiltersOpen }));
        },

        hasActiveFilters: () => {
            const state = get();
            return !!(
                state.categoryId ||
                state.brandId ||
                state.professional !== undefined ||
                state.minPrice ||
                state.maxPrice ||
                state.search
            );
        },

        getActiveFiltersCount: () => {
            const state = get();
            let count = 0;

            if (state.categoryId) count++;
            if (state.brandId) count++;
            if (state.professional !== undefined) count++;
            if (state.minPrice || state.maxPrice) count++;
            if (state.search) count++;

            return count;
        },
    }))
);

// Подписка на изменения фильтров для аналитики
useFiltersStore.subscribe(
    (state) => ({
        categoryId: state.categoryId,
        brandId: state.brandId,
        professional: state.professional,
        minPrice: state.minPrice,
        maxPrice: state.maxPrice,
    }),
    (filters) => {
        // Здесь можно отправлять события в аналитику
        console.log('Фильтры изменены:', filters);
    }
);