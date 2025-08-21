import type { Metadata } from "next";
import { loginMetadata } from "../metadata";
import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = loginMetadata;

export default function LoginPage() {
  return <LoginPageClient />;
}
