import type { Metadata } from "next";
import { Suspense } from "react";
import { registerMetadata } from "../metadata";
import RegisterPageClient from "./RegisterPageClient";

export const metadata: Metadata = registerMetadata;

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPageClient />
    </Suspense>
  );
}
