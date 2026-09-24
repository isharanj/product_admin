"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { ROUTES } from "@/lib/auth/constants";
import { Button } from "@/components/ui/Button";

interface ProductDetailViewProps {
  product: Product;
  onDelete: () => void;
  isDeleting?: boolean;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function ProductDetailView({
  product,
  onDelete,
  isDeleting = false,
}: ProductDetailViewProps) {
  const images =
    product.images?.length > 0
      ? product.images
      : product.thumbnail
        ? [product.thumbnail]
        : [];
  const [activeImage, setActiveImage] = useState(images[0] ?? "");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm capitalize text-slate-500">
            {product.category.replace(/-/g, " ")}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {product.title}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={ROUTES.productEdit(product.id)}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <Button variant="danger" loading={isDeleting} onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {activeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeImage}
                alt={product.title}
                className="aspect-square w-full object-contain bg-slate-50"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-slate-100 text-sm text-slate-500">
                No image available
              </div>
            )}
          </div>
          {images.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {images.map((image) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  className={`overflow-hidden rounded-lg border ${
                    activeImage === image
                      ? "border-teal-600 ring-2 ring-teal-600/30"
                      : "border-slate-200"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt=""
                    className="h-16 w-16 object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm leading-relaxed text-slate-700">
            {product.description}
          </p>

          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-500">Price</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-900">
                {formatPrice(product.price)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Rating</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {Number(product.rating ?? 0).toFixed(2)} / 5
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Stock</dt>
              <dd className="mt-1 font-medium text-slate-900">{product.stock}</dd>
            </div>
            {product.brand ? (
              <div>
                <dt className="text-slate-500">Brand</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {product.brand}
                </dd>
              </div>
            ) : null}
            {product.availabilityStatus ? (
              <div>
                <dt className="text-slate-500">Availability</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {product.availabilityStatus}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Reviews</h2>
        {!product.reviews || product.reviews.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No reviews yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {product.reviews.map((review, index) => (
              <li
                key={`${review.reviewerEmail}-${index}`}
                className="rounded-lg border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">
                    {review.reviewerName}
                  </p>
                  <p className="text-sm text-slate-600">
                    ★ {review.rating} ·{" "}
                    {new Date(review.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="mt-2 text-sm text-slate-700">{review.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
