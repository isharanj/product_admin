import type { Product, SortOption } from "@/types/product";
import { parseSortOption } from "@/lib/products/url-state";

function compareNullable(
  a: number | string | null | undefined,
  b: number | string | null | undefined,
  order: "asc" | "desc"
): number {
  const aMissing = a === null || a === undefined || a === "";
  const bMissing = b === null || b === undefined || b === "";

  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;

  let result = 0;
  if (typeof a === "string" && typeof b === "string") {
    result = a.localeCompare(b, undefined, { sensitivity: "base" });
  } else {
    result = Number(a) - Number(b);
  }

  return order === "asc" ? result : -result;
}

export function sortProducts(
  products: Product[],
  sort: SortOption
): Product[] {
  const { sortBy, order } = parseSortOption(sort);
  return [...products].sort((a, b) => {
    const primary = compareNullable(a[sortBy], b[sortBy], order);
    if (primary !== 0) return primary;
    // Deterministic tie-breaker
    return a.id - b.id;
  });
}

export function productMatchesCategory(
  product: Product,
  category: string
): boolean {
  if (!category) return true;
  return product.category.toLowerCase() === category.toLowerCase();
}

export function productMatchesSearch(
  product: Product,
  search: string
): boolean {
  if (!search) return true;
  const q = search.toLowerCase();
  return (
    product.title.toLowerCase().includes(q) ||
    product.description.toLowerCase().includes(q) ||
    product.category.toLowerCase().includes(q) ||
    (product.brand?.toLowerCase().includes(q) ?? false)
  );
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number
): { items: T[]; total: number; start: number; end: number } {
  const total = items.length;
  const startIndex = (page - 1) * pageSize;
  const slice = items.slice(startIndex, startIndex + pageSize);
  const start = total === 0 ? 0 : startIndex + 1;
  const end = Math.min(startIndex + pageSize, total);
  return { items: slice, total, start, end };
}
