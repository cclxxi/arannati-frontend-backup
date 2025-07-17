import type { Metadata } from "next";
import { registerMetadata } from "../metadata";
import RegisterPageClient from "./RegisterPageClient";

export const metadata: Metadata = registerMetadata;

export default function RegisterPage() {
  return <RegisterPageClient />;
}
