import type { Metadata } from "next";
import { forgotPasswordMetadata } from "../metadata";
import ForgotPasswordPageClient from "./ForgotPasswordPageClient";

export const metadata: Metadata = forgotPasswordMetadata;

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageClient />;
}
