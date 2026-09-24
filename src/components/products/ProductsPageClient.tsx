"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useProducts } from "@/hooks/useProducts";
import { useProductMutations } from "@/context/ProductsMutationProvider";
import { deleteProduct } from "@/lib/api/products";
import type { ApiError } from "@/types/api";
import type { Product, SortOption } from "@/types/product";
import {
  buildProductsQueryString,
  parseProductsSearchParams,
} from "@/lib/products/url-state";
import { ROUTES } from "@/lib/auth/constants";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductTable } from "@/components/products/ProductTable";
import { Pagination } from "@/components/products/Pagination";
import { ProductTableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";

export function ProductsPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const { removeLocalProduct } = useProductMutations();

  const urlState = useMemo(
    () => parseProductsSearchParams(searchParams),
    [searchParams]
  );

  const [searchInput, setSearchInput] = useState(urlState.search);
  const debouncedSearch = useDebounce(searchInput, 400);

  const listState = useMemo(
    () => ({ ...urlState, search: debouncedSearch }),
    [urlState, debouncedSearch]
  );

  const {
    products,
    total,
    start,
    end,
    page,
    totalPages,
    isLoading,
    error,
    retry,
  } = useProducts(listState);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function updateUrl(overrides: Partial<typeof urlState>) {
    const next = { ...urlState, search: debouncedSearch, ...overrides };
    const qs = buildProductsQueryString(urlState, next);
    startTransition(() => {
      router.replace(`${pathname}${qs}`);
    });
  }

  // Keep search input in sync when URL changes externally (back/forward/share).
  useEffect(() => {
    setSearchInput(urlState.search);
  }, [urlState.search]);

  // Push debounced search into the URL (resets page to 1).
  useEffect(() => {
    if (debouncedSearch === urlState.search) return;
    updateUrl({ search: debouncedSearch, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Normalize invalid/out-of-range page in the URL once data is known.
  useEffect(() => {
    if (isLoading || error) return;
    if (page !== urlState.page) {
      updateUrl({ page });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, urlState.page, isLoading, error]);

  async function handleConfirmDelete() {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteProduct(deleteTarget.id);
      removeLocalProduct(deleteTarget.id);
      setSuccessMessage(`Deleted “${deleteTarget.title}” for this session.`);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError((err as ApiError).message);
    } finally {
      setIsDeleting(false);
    }
  }

  function clearFilters() {
    setSearchInput("");
    updateUrl({
      search: "",
      category: "",
      sort: "title-asc",
      page: 1,
    });
  }

  const emptyDescription = urlState.search || urlState.category
    ? "Try adjusting your search or category filters."
    : "There are no products to display.";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-slate-900">
            Products
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Search, filter, and manage your product catalog.
          </p>
        </div>
        <Link href={ROUTES.productNew}>
          <Button>Add product</Button>
        </Link>
      </div>

      {successMessage ? (
        <div
          className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800"
          role="status"
        >
          {successMessage}
        </div>
      ) : null}

      <ProductFilters
        search={searchInput}
        category={urlState.category}
        sort={urlState.sort}
        pageSize={urlState.pageSize}
        onSearchChange={setSearchInput}
        onCategoryChange={(category) =>
          updateUrl({ category, page: 1 })
        }
        onSortChange={(sort: SortOption) => updateUrl({ sort, page: 1 })}
        onPageSizeChange={(pageSize) =>
          updateUrl({ pageSize: pageSize as typeof urlState.pageSize, page: 1 })
        }
        onClearFilters={clearFilters}
      />

      {isLoading ? <ProductTableSkeleton /> : null}

      {!isLoading && error ? (
        <ErrorState message={error.message} onRetry={retry} />
      ) : null}

      {!isLoading && !error && products.length === 0 ? (
        <EmptyState
          title="No products found"
          description={emptyDescription}
          actionLabel={
            urlState.search || urlState.category ? "Clear filters" : undefined
          }
          onAction={
            urlState.search || urlState.category ? clearFilters : undefined
          }
        />
      ) : null}

      {!isLoading && !error && products.length > 0 ? (
        <>
          <ProductTable
            products={products}
            onDelete={(product) => {
              setDeleteError(null);
              setDeleteTarget(product);
            }}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            start={start}
            end={end}
            onPageChange={(nextPage) => updateUrl({ page: nextPage })}
          />
        </>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete product"
        description={
          <>
            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.title}</strong>?
            </p>
            <p className="mt-2 text-slate-500">
              DummyJSON only simulates deletion. This dashboard will hide the
              product for the rest of your browser session.
            </p>
            {deleteError ? (
              <p className="mt-2 text-red-600" role="alert">
                {deleteError}
              </p>
            ) : null}
          </>
        }
        confirmLabel="Delete"
        danger
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
