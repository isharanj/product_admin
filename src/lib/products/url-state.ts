import {
  PAGE_SIZES,
  SORT_OPTIONS,
  type PageSize,
  type SortOption,
} from "@/types/product";

export interface ProductsUrlState {
  page: number;
  pageSize: PageSize;
  search: string;
  category: string;
  sort: SortOption;
}

const DEFAULT_STATE: ProductsUrlState = {
  page: 1,
  pageSize: 20,
  search: "",
  category: "",
  sort: "title-asc",
};

const VALID_SORTS = new Set(SORT_OPTIONS.map((o) => o.value));
const VALID_PAGE_SIZES = new Set<number>(PAGE_SIZES);

function parsePositiveInt(value: string | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) return null;
  return n;
}

export function parseProductsSearchParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>
): ProductsUrlState {
  const get = (key: string): string | null => {
    if (params instanceof URLSearchParams) {
      return params.get(key);
    }
    const value = params[key];
    if (Array.isArray(value)) return value[0] ?? null;
    return value ?? null;
  };

  const rawPage = parsePositiveInt(get("page"));
  const rawPageSize = Number(get("pageSize"));
  const rawSort = get("sort") ?? "";
  const rawSearch = get("search") ?? "";
  const rawCategory = get("category") ?? "";

  const pageSize: PageSize = VALID_PAGE_SIZES.has(rawPageSize)
    ? (rawPageSize as PageSize)
    : DEFAULT_STATE.pageSize;

  const sort: SortOption = VALID_SORTS.has(rawSort as SortOption)
    ? (rawSort as SortOption)
    : DEFAULT_STATE.sort;

  return {
    page: rawPage ?? DEFAULT_STATE.page,
    pageSize,
    search: rawSearch.trim(),
    category: rawCategory.trim(),
    sort,
  };
}

export function buildProductsQueryString(
  state: ProductsUrlState,
  overrides: Partial<ProductsUrlState> = {}
): string {
  const next = { ...state, ...overrides };
  const params = new URLSearchParams();

  if (next.page !== DEFAULT_STATE.page) {
    params.set("page", String(next.page));
  }
  if (next.pageSize !== DEFAULT_STATE.pageSize) {
    params.set("pageSize", String(next.pageSize));
  }
  if (next.search) {
    params.set("search", next.search);
  }
  if (next.category) {
    params.set("category", next.category);
  }
  if (next.sort !== DEFAULT_STATE.sort) {
    params.set("sort", next.sort);
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function normalizePage(page: number, totalPages: number): number {
  if (totalPages < 1) return 1;
  if (!Number.isFinite(page) || page < 1) return 1;
  if (page > totalPages) return totalPages;
  return page;
}

export function parseSortOption(
  sort: SortOption
): { sortBy: "price" | "rating" | "title"; order: "asc" | "desc" } {
  const [field, order] = sort.split("-") as [
    "price" | "rating" | "title",
    "asc" | "desc",
  ];
  return { sortBy: field, order };
}

export function getDefaultProductsState(): ProductsUrlState {
  return { ...DEFAULT_STATE };
}
