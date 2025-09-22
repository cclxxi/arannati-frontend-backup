// src/components/catalog/CatalogFiltersSync.tsx
"use client";

import { useEffect, useRef } from "react";
import { useFiltersStore } from "@/stores/filters";
import { useRouter, useSearchParams } from "next/navigation";

export default function CatalogFiltersSync() {
  const setFilter = useFiltersStore((s) => s.setFilter);
  const searchParams = useSearchParams();
  const router = useRouter();
  const appliedRef = useRef(false);

  useEffect(() => {
    if (appliedRef.current) return;

    const brandIdStr = searchParams.get("brandId");
    const categoryIdStr = searchParams.get("categoryId");

    let changed = false;

    if (brandIdStr) {
      const id = Number(brandIdStr);
      if (Number.isFinite(id)) {
        setFilter("brandId", id);
        changed = true;
      }
    }

    if (categoryIdStr) {
      const id = Number(categoryIdStr);
      if (Number.isFinite(id)) {
        setFilter("categoryId", id);
        changed = true;
      }
    }

    if (changed) {
      appliedRef.current = true;
      // Очищаем URL после применения фильтров
      router.replace("/catalog");
    }
  }, [searchParams, setFilter, router]);

  return null;
}
