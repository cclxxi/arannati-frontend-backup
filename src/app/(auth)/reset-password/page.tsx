import type { Metadata } from "next";
import { resetPasswordMetadata } from "../metadata";
import ResetPasswordPageClient from "./ResetPasswordPageClient";
import { Suspense } from "react";

export const metadata: Metadata = resetPasswordMetadata;

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPageClient />
    </Suspense>
  );
}
