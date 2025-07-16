import { useThemeStore } from '@/stores';

export function useTheme() {
    const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore();

    return {
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        isDark: resolvedTheme === 'dark',
        isLight: resolvedTheme === 'light',
        isSystem: theme === 'system',
    };
}