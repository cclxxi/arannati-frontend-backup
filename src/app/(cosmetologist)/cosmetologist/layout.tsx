import type { Metadata } from 'next';
import { CosmetologistLayout } from '@/components/layouts/CosmetologistLayout';
import React from "react";

export const metadata: Metadata = {
    title: {
        template: '%s | Панель косметолога | Arannati',
        default: 'Панель косметолога',
    },
};

export default function CosmetologistRoutesLayout({
                                                      children,
                                                  }: {
    children: React.ReactNode;
}) {
    return <CosmetologistLayout>{children}</CosmetologistLayout>;
}