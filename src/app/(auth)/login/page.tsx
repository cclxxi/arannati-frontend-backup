import type { Metadata } from "next";
import { Suspense } from "react";
import { loginMetadata } from "../metadata";
import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = loginMetadata;

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageClient />
    </Suspense>
  );
}
