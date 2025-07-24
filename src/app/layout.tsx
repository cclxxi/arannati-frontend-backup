import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { QueryProvider } from "@/lib/react-query/provider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AppAuthProvider } from "@/components/providers/AppAuthProvider";
import { AntdRenderProvider } from "@/components/providers/AntdRenderProvider";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import React from "react";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: {
    default: "Arannati - Профессиональная косметика",
    template: "%s | Arannati",
  },
  description:
    "Интернет-магазин профессиональной косметики Arannati в Казахстане",
  keywords: [
    "косметика",
    "профессиональная косметика",
    "уход за кожей",
    "Казахстан",
  ],
  authors: [{ name: "Arannati" }],
  creator: "Arannati",
  publisher: "Arannati",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ru_KZ",
    url: "https://arannati.kz",
    siteName: "Arannati",
    title: "Arannati - Профессиональная косметика",
    description: "Интернет-магазин профессиональной косметики в Казахстане",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arannati - Профессиональная косметика",
    description: "Интернет-магазин профессиональной косметики в Казахстане",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

// Компонент для инициализации темы до рендера
function ThemeScript() {
  const themeScript = `
    (function() {
      try {
        const storageKey = 'theme-storage';
        const savedTheme = localStorage.getItem(storageKey);
        let theme = 'system';
        
        if (savedTheme) {
          const parsed = JSON.parse(savedTheme);
          theme = parsed.state?.theme || 'system';
        }
        
        let resolved = theme;
        if (theme === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        document.documentElement.classList.add(resolved);
        document.documentElement.setAttribute('data-theme', resolved);
        
        // Устанавливаем meta тег для мобильных браузеров с цветами Arannati
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', resolved === 'dark' ? '#2a3a33' : '#efe9df');
        }
      } catch (e) {
        console.error('Failed to initialize theme:', e);
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <title></title>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <AppAuthProvider>
                <AntdRenderProvider>
                  <AntdRegistry>
                    {children}
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        duration: 4000,
                        style: {
                          background: "var(--color-surface)",
                          color: "var(--color-text-primary)",
                        },
                      }}
                    />
                  </AntdRegistry>
                </AntdRenderProvider>
              </AppAuthProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
