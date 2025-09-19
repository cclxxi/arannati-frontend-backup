import type { Metadata } from "next";
import { Suspense } from "react";
import { cosmetologistMetadata } from "../../metadata";
import CosmetologistRegisterPageClient from "./CosmetologistRegisterPageClient";

export const metadata: Metadata = cosmetologistMetadata;

export default function RegisterCosmetologistPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CosmetologistRegisterPageClient />
    </Suspense>
  );
}
