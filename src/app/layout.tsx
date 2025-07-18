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
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
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
                        duration: 3000,
                        style: {
                          background: "#363636",
                          color: "#fff",
                          borderRadius: "8px",
                        },
                        className: "dark:bg-gray-800 dark:text-white",
                        success: {
                          iconTheme: {
                            primary: "#4CAF50",
                            secondary: "#fff",
                          },
                        },
                        error: {
                          iconTheme: {
                            primary: "#F44336",
                            secondary: "#fff",
                          },
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
