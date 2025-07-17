import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | Arannati",
    default: "Авторизация",
  },
};

export default function AuthRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
