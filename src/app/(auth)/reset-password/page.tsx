import type { Metadata } from "next";
import { Suspense } from "react";
import { resetPasswordMetadata } from "../metadata";
import ResetPasswordPageClient from "./ResetPasswordPageClient";

export const metadata: Metadata = resetPasswordMetadata;

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPageClient />
    </Suspense>
  );
}
