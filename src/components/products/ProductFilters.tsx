"use client";

import { useEffect, useState } from "react";
import { getCategories } from "@/lib/api/categories";
import { isCancelledError } from "@/lib/api/errors";
import type { ApiError } from "@/types/api";
import type { Category, SortOption } from "@/types/product";
import { SORT_OPTIONS, PAGE_SIZES } from "@/types/product";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface ProductFiltersProps {
  search: string;
  category: string;
  sort: SortOption;
  pageSize: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onPageSizeChange: (value: number) => void;
  onClearFilters: () => void;
}

export function ProductFilters({
  search,
  category,
  sort,
  pageSize,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onPageSizeChange,
  onClearFilters,
}: ProductFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const data = await getCategories({ signal: controller.signal });
        if (!active) return;
        setCategories(data);
      } catch (error) {
        if (!active || isCancelledError(error)) return;
        setCategoriesError((error as ApiError).message);
      } finally {
        if (active) {
          setCategoriesLoading(false);
        }
      }
    }

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [retryToken]);

  const hasActiveFilters = Boolean(search || category || sort !== "title-asc");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input
          label="Search"
          name="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          autoComplete="off"
        />

        <div>
          <Select
            label="Category"
            name="category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            disabled={categoriesLoading}
            options={[
              { value: "", label: categoriesLoading ? "Loading…" : "All Categories" },
              ...categories.map((c) => ({ value: c.slug, label: c.name })),
            ]}
          />
          {categoriesError ? (
            <div className="mt-1 flex items-center gap-2 text-xs text-red-600">
              <span>{categoriesError}</span>
              <button
                type="button"
                className="underline"
                onClick={() => setRetryToken((n) => n + 1)}
              >
                Retry
              </button>
            </div>
          ) : null}
        </div>

        <Select
          label="Sort by"
          name="sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          options={SORT_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
        />

        <Select
          label="Page size"
          name="pageSize"
          value={String(pageSize)}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          options={PAGE_SIZES.map((size) => ({
            value: String(size),
            label: `${size} / page`,
          }))}
        />
      </div>

      {hasActiveFilters ? (
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear filters
          </Button>
        </div>
      ) : null}
    </div>
  );
}
