import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "@/constants";

declare global {
  interface Window {
    __themeCleanup?: () => void;
  }
}

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

// Функция для определения системной темы
const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// Функция для определения итоговой темы
const resolveTheme = (theme: Theme): "light" | "dark" => {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      resolvedTheme: "light",

      setTheme: (theme) => {
        const resolved = resolveTheme(theme);

        set({
          theme,
          resolvedTheme: resolved,
        });

        // Применяем тему к document
        if (typeof window !== "undefined") {
          document.documentElement.classList.remove("light", "dark");
          document.documentElement.classList.add(resolved);

          // Обновляем meta тег для мобильных браузеров
          const metaThemeColor = document.querySelector(
            'meta[name="theme-color"]',
          );
          if (metaThemeColor) {
            metaThemeColor.setAttribute(
              "content",
              resolved === "dark" ? "#1a1a2e" : "#ffffff",
            );
          }
        }
      },

      toggleTheme: () => {
        const { theme } = get();
        const nextTheme = theme === "light" ? "dark" : "light";
        get().setTheme(nextTheme);
      },

      initializeTheme: () => {
        const { theme } = get();
        const resolved = resolveTheme(theme);

        set({ resolvedTheme: resolved });

        // Применяем тему при инициализации
        if (typeof window !== "undefined") {
          document.documentElement.classList.add(resolved);

          // Слушаем изменения системной темы
          const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
          const handleChange = () => {
            const currentTheme = get().theme;
            if (currentTheme === "system") {
              get().setTheme("system");
            }
          };

          mediaQuery.addEventListener("change", handleChange);

          // Cleanup функция сохраняется в window для удаления позже
          window.__themeCleanup = () => {
            mediaQuery.removeEventListener("change", handleChange);
          };
        }
      },
    }),
    {
      name: STORAGE_KEYS.THEME,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
