import type { Metadata } from "next";
import { resetPasswordMetadata } from "../metadata";
import ResetPasswordPageClient from "./ResetPasswordPageClient";

export const metadata: Metadata = resetPasswordMetadata;

export default function ResetPasswordPage() {
  return <ResetPasswordPageClient />;
}
