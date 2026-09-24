"use client";

import Link from "next/link";
import type { Product } from "@/types/product";
import { ROUTES } from "@/lib/auth/constants";
import { Button } from "@/components/ui/Button";

interface ProductTableProps {
  products: Product[];
  onDelete: (product: Product) => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function ProductTable({ products, onDelete }: ProductTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3">
                Product
              </th>
              <th scope="col" className="px-4 py-3">
                Category
              </th>
              <th scope="col" className="px-4 py-3">
                Price
              </th>
              <th scope="col" className="px-4 py-3">
                Rating
              </th>
              <th scope="col" className="px-4 py-3">
                Stock
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr
                key={product.id}
                className="transition-colors hover:bg-slate-50/80"
              >
                <td className="px-4 py-3">
                  <Link
                    href={ROUTES.product(product.id)}
                    className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-lg"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.thumbnail}
                      alt=""
                      className="h-12 w-12 rounded-lg border border-slate-200 object-cover bg-slate-100"
                    />
                    <span className="font-medium text-slate-900 hover:text-teal-800">
                      {product.title}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 capitalize text-slate-600">
                  {product.category.replace(/-/g, " ")}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {formatPrice(product.price)}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {Number(product.rating ?? 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-slate-700">{product.stock}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={ROUTES.product(product.id)}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={ROUTES.productEdit(product.id)}>
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(product)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {products.map((product) => (
          <article
            key={product.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.thumbnail}
                alt=""
                className="h-16 w-16 rounded-lg border border-slate-200 object-cover bg-slate-100"
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={ROUTES.product(product.id)}
                  className="font-medium text-slate-900 hover:text-teal-800"
                >
                  {product.title}
                </Link>
                <p className="mt-1 text-xs capitalize text-slate-500">
                  {product.category.replace(/-/g, " ")}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-700">
                  <span>{formatPrice(product.price)}</span>
                  <span>★ {Number(product.rating ?? 0).toFixed(2)}</span>
                  <span>Stock {product.stock}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Link href={ROUTES.product(product.id)} className="flex-1">
                <Button variant="ghost" size="sm" className="w-full">
                  View
                </Button>
              </Link>
              <Link href={ROUTES.productEdit(product.id)} className="flex-1">
                <Button variant="secondary" size="sm" className="w-full">
                  Edit
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                onClick={() => onDelete(product)}
              >
                Delete
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
