"use client";

import { useEffect } from "react";
import { suppressConsoleWarnings } from "@/utils/suppressWarnings";

export default function WarningSuppressionProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      suppressConsoleWarnings();
    }
  }, []);

  return null;
}
