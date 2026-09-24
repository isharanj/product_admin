"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getProduct,
  getProducts,
  getProductsByCategory,
  searchProducts,
} from "@/lib/api/products";
import { isCancelledError } from "@/lib/api/errors";
import type { ApiError } from "@/types/api";
import type { Product } from "@/types/product";
import type { ProductsUrlState } from "@/lib/products/url-state";
import {
  normalizePage,
  parseSortOption,
} from "@/lib/products/url-state";
import { paginateItems } from "@/lib/products/sort";
import {
  applyMutations,
  filterMutatedProducts,
} from "@/lib/products/mutations";
import { useProductMutations } from "@/context/ProductsMutationProvider";

export interface ProductsListResult {
  products: Product[];
  total: number;
  start: number;
  end: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: ApiError | null;
  retry: () => void;
}

/**
 * Fetches products with URL-driven filters.
 *
 * DummyJSON cannot combine search + category server-side. When both are
 * active (or when session mutations exist), we fetch the relevant dataset
 * and filter / sort / paginate on the client.
 *
 * Race protection uses AbortController + a monotonic requestId so stale
 * responses never overwrite newer results.
 */
export function useProducts(urlState: ProductsUrlState): ProductsListResult {
  const { mutations } = useProductMutations();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [page, setPage] = useState(urlState.page);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const requestIdRef = useRef(0);

  const retry = useCallback(() => {
    setRetryToken((n) => n + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const requestId = ++requestIdRef.current;
    const { search, category, sort, pageSize } = urlState;
    const { sortBy, order } = parseSortOption(sort);

    const hasMutations =
      mutations.created.length > 0 ||
      mutations.deleted.length > 0 ||
      Object.keys(mutations.updated).length > 0;

    const needsClientPipeline = Boolean(search && category) || hasMutations;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        let pageProducts: Product[] = [];
        let computedTotal = 0;
        let computedStart = 0;
        let computedEnd = 0;
        let resolvedPage = urlState.page;

        if (needsClientPipeline) {
          let source: Product[] = [];

          if (search) {
            const response = await searchProducts(
              search,
              { limit: 0 },
              { signal: controller.signal }
            );
            source = response.products;
          } else if (category) {
            const response = await getProductsByCategory(
              category,
              { limit: 0 },
              { signal: controller.signal }
            );
            source = response.products;
          } else {
            const response = await getProducts(
              { limit: 0 },
              { signal: controller.signal }
            );
            source = response.products;
          }

          if (requestId !== requestIdRef.current) return;

          const merged = applyMutations(source, mutations);
          const filtered = filterMutatedProducts(merged, {
            // Search already applied by the search endpoint when present;
            // still re-apply for locally created products.
            search: search ? search : "",
            category,
            sort,
          });

          const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
          resolvedPage = normalizePage(urlState.page, Math.max(1, Math.ceil(filtered.length / pageSize) || 1));
          // If there are zero results, keep page at 1.
          if (filtered.length === 0) {
            resolvedPage = 1;
          } else {
            resolvedPage = normalizePage(
              urlState.page,
              Math.ceil(filtered.length / pageSize)
            );
          }

          const paged = paginateItems(filtered, resolvedPage, pageSize);
          pageProducts = paged.items;
          computedTotal = paged.total;
          computedStart = paged.start;
          computedEnd = paged.end;
          void totalPages;
        } else if (search) {
          const result = await fetchServerPage({
            mode: "search",
            search,
            category: "",
            page: urlState.page,
            pageSize,
            sortBy,
            order,
            signal: controller.signal,
          });
          if (requestId !== requestIdRef.current) return;
          pageProducts = result.products;
          computedTotal = result.total;
          computedStart = result.start;
          computedEnd = result.end;
          resolvedPage = result.page;
        } else if (category) {
          const result = await fetchServerPage({
            mode: "category",
            search: "",
            category,
            page: urlState.page,
            pageSize,
            sortBy,
            order,
            signal: controller.signal,
          });
          if (requestId !== requestIdRef.current) return;
          pageProducts = result.products;
          computedTotal = result.total;
          computedStart = result.start;
          computedEnd = result.end;
          resolvedPage = result.page;
        } else {
          const result = await fetchServerPage({
            mode: "all",
            search: "",
            category: "",
            page: urlState.page,
            pageSize,
            sortBy,
            order,
            signal: controller.signal,
          });
          if (requestId !== requestIdRef.current) return;
          pageProducts = result.products;
          computedTotal = result.total;
          computedStart = result.start;
          computedEnd = result.end;
          resolvedPage = result.page;
        }

        if (requestId !== requestIdRef.current) return;

        setProducts(pageProducts);
        setTotal(computedTotal);
        setStart(computedStart);
        setEnd(computedEnd);
        setPage(resolvedPage);
      } catch (err) {
        if (isCancelledError(err) || requestId !== requestIdRef.current) {
          return;
        }
        setError(err as ApiError);
        setProducts([]);
        setTotal(0);
        setStart(0);
        setEnd(0);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      controller.abort();
    };
  }, [urlState, mutations, retryToken]);

  const totalPages =
    total === 0 ? 1 : Math.max(1, Math.ceil(total / urlState.pageSize));

  return {
    products,
    total,
    start,
    end,
    page,
    totalPages,
    isLoading,
    error,
    retry,
  };
}

interface ServerPageArgs {
  mode: "all" | "search" | "category";
  search: string;
  category: string;
  page: number;
  pageSize: number;
  sortBy: "price" | "rating" | "title";
  order: "asc" | "desc";
  signal: AbortSignal;
}

async function fetchServerPage(args: ServerPageArgs): Promise<{
  products: Product[];
  total: number;
  start: number;
  end: number;
  page: number;
}> {
  const { mode, search, category, pageSize, sortBy, order, signal } = args;
  let page = args.page;

  const load = async (targetPage: number) => {
    const skip = (targetPage - 1) * pageSize;
    const params = { limit: pageSize, skip, sortBy, order };

    if (mode === "search") {
      return searchProducts(search, params, { signal });
    }
    if (mode === "category") {
      return getProductsByCategory(category, params, { signal });
    }
    return getProducts(params, { signal });
  };

  let response = await load(page);

  if (response.total > 0) {
    const totalPages = Math.ceil(response.total / pageSize);
    const normalized = normalizePage(page, totalPages);
    if (normalized !== page) {
      page = normalized;
      response = await load(page);
    }
  } else {
    page = 1;
  }

  const start = response.total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, response.total);

  return {
    products: response.products,
    total: response.total,
    start,
    end,
    page,
  };
}

export interface ProductDetailResult {
  product: Product | null;
  isLoading: boolean;
  error: ApiError | null;
  notFound: boolean;
  retry: () => void;
}

export function useProductDetail(id: string): ProductDetailResult {
  const { getLocalProductOverride, isLocallyDeleted, mutations } =
    useProductMutations();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const requestIdRef = useRef(0);

  const retry = useCallback(() => {
    setRetryToken((n) => n + 1);
  }, []);

  useEffect(() => {
    const numericId = Number(id);
    if (!id || Number.isNaN(numericId) || numericId < 1) {
      setNotFound(true);
      setProduct(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (isLocallyDeleted(numericId)) {
      setNotFound(true);
      setProduct(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const localOverride = getLocalProductOverride(numericId);
    const isSessionCreated = mutations.created.some((p) => p.id === numericId);

    const controller = new AbortController();
    const requestId = ++requestIdRef.current;

    async function load() {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      // Session-created products are not persisted by DummyJSON.
      if (isSessionCreated && localOverride) {
        setProduct(localOverride);
        setIsLoading(false);
        return;
      }

      try {
        const data = await getProduct(numericId, {
          signal: controller.signal,
        });

        if (requestId !== requestIdRef.current) return;

        setProduct(localOverride ? { ...data, ...localOverride } : data);
      } catch (err) {
        if (isCancelledError(err) || requestId !== requestIdRef.current) {
          return;
        }
        const apiError = err as ApiError;
        if (localOverride) {
          setProduct(localOverride);
          setNotFound(false);
        } else if (apiError.code === "NOT_FOUND" || apiError.status === 404) {
          setNotFound(true);
          setProduct(null);
        } else {
          setError(apiError);
          setProduct(null);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      controller.abort();
    };
  }, [
    id,
    retryToken,
    getLocalProductOverride,
    isLocallyDeleted,
    mutations.created,
  ]);

  return { product, isLoading, error, notFound, retry };
}
