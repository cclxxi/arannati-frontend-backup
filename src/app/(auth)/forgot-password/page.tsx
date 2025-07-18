import type { Metadata } from "next";
import { Suspense } from "react";
import { forgotPasswordMetadata } from "../metadata";
import ForgotPasswordPageClient from "./ForgotPasswordPageClient";

export const metadata: Metadata = forgotPasswordMetadata;

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordPageClient />
    </Suspense>
  );
}
