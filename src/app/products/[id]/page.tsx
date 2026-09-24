"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useProductDetail } from "@/hooks/useProducts";
import { useProductMutations } from "@/context/ProductsMutationProvider";
import { deleteProduct } from "@/lib/api/products";
import type { ApiError } from "@/types/api";
import { ROUTES } from "@/lib/auth/constants";
import { ProductDetailView } from "@/components/products/ProductDetailView";
import { DetailSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { product, isLoading, error, notFound, retry } = useProductDetail(id);
  const { removeLocalProduct } = useProductMutations();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    if (!product || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteProduct(product.id);
      removeLocalProduct(product.id);
      router.replace(ROUTES.products);
    } catch (err) {
      setDeleteError((err as ApiError).message);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Product not found
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          The product you are looking for does not exist or was removed in this
          session.
        </p>
        <Link href={ROUTES.products} className="mt-6 inline-block">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  if (error || !product) {
    return (
      <ErrorState
        message={error?.message ?? "Unable to load this product."}
        onRetry={retry}
      />
    );
  }

  return (
    <>
      <div className="mb-4">
        <Link
          href={ROUTES.products}
          className="text-sm font-medium text-teal-800 hover:underline"
        >
          ← Back to Products
        </Link>
      </div>

      <ProductDetailView
        product={product}
        isDeleting={isDeleting}
        onDelete={() => {
          setDeleteError(null);
          setConfirmOpen(true);
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete product"
        description={
          <>
            <p>
              Are you sure you want to delete <strong>{product.title}</strong>?
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
        onConfirm={handleDelete}
        onCancel={() => {
          if (!isDeleting) setConfirmOpen(false);
        }}
      />
    </>
  );
}
