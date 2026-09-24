import type { Product } from "@/types/product";
import {
  productMatchesCategory,
  productMatchesSearch,
  sortProducts,
} from "@/lib/products/sort";
import type { SortOption } from "@/types/product";

export interface ProductMutations {
  created: Product[];
  updated: Record<number, Product>;
  deleted: number[];
}

export function applyMutations(
  products: Product[],
  mutations: ProductMutations
): Product[] {
  const deleted = new Set(mutations.deleted);
  const byId = new Map<number, Product>();

  for (const product of products) {
    if (deleted.has(product.id)) continue;
    const override = mutations.updated[product.id];
    byId.set(product.id, override ? { ...product, ...override } : product);
  }

  for (const created of mutations.created) {
    if (deleted.has(created.id)) continue;
    const override = mutations.updated[created.id];
    byId.set(created.id, override ? { ...created, ...override } : created);
  }

  return Array.from(byId.values());
}

export function filterMutatedProducts(
  products: Product[],
  options: {
    search: string;
    category: string;
    sort: SortOption;
  }
): Product[] {
  let result = products;

  if (options.search) {
    result = result.filter((p) => productMatchesSearch(p, options.search));
  }
  if (options.category) {
    result = result.filter((p) => productMatchesCategory(p, options.category));
  }

  return sortProducts(result, options.sort);
}

export const EMPTY_MUTATIONS: ProductMutations = {
  created: [],
  updated: {},
  deleted: [],
};
