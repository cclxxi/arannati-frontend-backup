import type { Metadata } from "next";
import { forgotPasswordMetadata } from "../metadata";
import ForgotPasswordPageClient from "./ForgotPasswordPageClient";
import { Suspense } from "react";

export const metadata: Metadata = forgotPasswordMetadata;

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordPageClient />
    </Suspense>
  );
}
