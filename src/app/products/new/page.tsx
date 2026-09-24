"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { addProduct } from "@/lib/api/products";
import { useProductMutations } from "@/context/ProductsMutationProvider";
import { ROUTES } from "@/lib/auth/constants";
import { ProductForm } from "@/components/products/ProductForm";

export default function NewProductPage() {
  const router = useRouter();
  const { addLocalProduct } = useProductMutations();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <Link
          href={ROUTES.products}
          className="text-sm font-medium text-teal-800 hover:underline"
        >
          ← Back to Products
        </Link>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-slate-900">
          Add product
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          DummyJSON simulates creation and does not persist products. Successful
          saves are kept in local session state so they remain visible until you
          refresh the browser storage or close the tab session context.
        </p>
      </div>

      <ProductForm
        submitLabel="Create product"
        onCancel={() => router.push(ROUTES.products)}
        onSubmit={async (values) => {
          const created = await addProduct({
            ...values,
            thumbnail:
              values.thumbnail ||
              "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp",
            images:
              values.images.length > 0
                ? values.images
                : [
                    "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp",
                  ],
          });

          addLocalProduct({
            ...created,
            thumbnail: created.thumbnail || values.thumbnail,
            images:
              created.images?.length > 0
                ? created.images
                : values.images.length > 0
                  ? values.images
                  : [created.thumbnail].filter(Boolean),
            reviews: created.reviews ?? [],
          });

          router.push(ROUTES.product(created.id));
        }}
      />
    </div>
  );
}
