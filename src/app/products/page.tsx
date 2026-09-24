import { Suspense } from "react";
import { ProductsPageClient } from "@/components/products/ProductsPageClient";
import { ProductTableSkeleton } from "@/components/ui/Skeleton";

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductTableSkeleton />}>
      <ProductsPageClient />
    </Suspense>
  );
}
