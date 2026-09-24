"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useProductDetail } from "@/hooks/useProducts";
import { useProductMutations } from "@/context/ProductsMutationProvider";
import { updateProduct } from "@/lib/api/products";
import { ROUTES } from "@/lib/auth/constants";
import { ProductForm } from "@/components/products/ProductForm";
import { DetailSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { product, isLoading, error, notFound, retry } = useProductDetail(id);
  const { updateLocalProduct } = useProductMutations();

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
          This product cannot be edited because it does not exist.
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
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <Link
          href={ROUTES.product(product.id)}
          className="text-sm font-medium text-teal-800 hover:underline"
        >
          ← Back to product
        </Link>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-slate-900">
          Edit product
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          DummyJSON simulates updates. Changes are applied to local session
          state so they remain visible during this browser session.
        </p>
      </div>

      <ProductForm
        initialValues={product}
        submitLabel="Save changes"
        onCancel={() => router.push(ROUTES.product(product.id))}
        onSubmit={async (values) => {
          const updated = await updateProduct(product.id, values);
          updateLocalProduct({
            ...product,
            ...updated,
            ...values,
            images:
              values.images.length > 0
                ? values.images
                : product.images ?? updated.images ?? [],
            thumbnail:
              values.thumbnail || product.thumbnail || updated.thumbnail,
          });
          router.push(ROUTES.product(product.id));
        }}
      />
    </div>
  );
}
