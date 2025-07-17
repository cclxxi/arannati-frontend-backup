import type { Metadata } from "next";
import { cosmetologistMetadata } from "../../metadata";
import CosmetologistRegisterPageClient from "./CosmetologistRegisterPageClient";

export const metadata: Metadata = cosmetologistMetadata;

export default function RegisterCosmetologistPage() {
  return <CosmetologistRegisterPageClient />;
}
