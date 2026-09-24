"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/types/product";
import {
  EMPTY_MUTATIONS,
  type ProductMutations,
} from "@/lib/products/mutations";

interface ProductsMutationContextValue {
  mutations: ProductMutations;
  addLocalProduct: (product: Product) => void;
  updateLocalProduct: (product: Product) => void;
  removeLocalProduct: (id: number) => void;
  getLocalProductOverride: (id: number) => Product | undefined;
  isLocallyDeleted: (id: number) => boolean;
}

const ProductsMutationContext =
  createContext<ProductsMutationContextValue | null>(null);

export function ProductsMutationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [mutations, setMutations] =
    useState<ProductMutations>(EMPTY_MUTATIONS);

  const addLocalProduct = useCallback((product: Product) => {
    setMutations((prev) => ({
      ...prev,
      created: [product, ...prev.created.filter((p) => p.id !== product.id)],
      deleted: prev.deleted.filter((id) => id !== product.id),
    }));
  }, []);

  const updateLocalProduct = useCallback((product: Product) => {
    setMutations((prev) => {
      const created = prev.created.map((p) =>
        p.id === product.id ? product : p
      );
      const alreadyCreated = prev.created.some((p) => p.id === product.id);

      return {
        ...prev,
        created: alreadyCreated ? created : prev.created,
        updated: {
          ...prev.updated,
          [product.id]: product,
        },
      };
    });
  }, []);

  const removeLocalProduct = useCallback((id: number) => {
    setMutations((prev) => ({
      created: prev.created.filter((p) => p.id !== id),
      updated: Object.fromEntries(
        Object.entries(prev.updated).filter(([key]) => Number(key) !== id)
      ),
      deleted: prev.deleted.includes(id)
        ? prev.deleted
        : [...prev.deleted, id],
    }));
  }, []);

  const getLocalProductOverride = useCallback(
    (id: number) => {
      const created = mutations.created.find((p) => p.id === id);
      if (created) {
        return mutations.updated[id]
          ? { ...created, ...mutations.updated[id] }
          : created;
      }
      return mutations.updated[id];
    },
    [mutations]
  );

  const isLocallyDeleted = useCallback(
    (id: number) => mutations.deleted.includes(id),
    [mutations.deleted]
  );

  const value = useMemo(
    () => ({
      mutations,
      addLocalProduct,
      updateLocalProduct,
      removeLocalProduct,
      getLocalProductOverride,
      isLocallyDeleted,
    }),
    [
      mutations,
      addLocalProduct,
      updateLocalProduct,
      removeLocalProduct,
      getLocalProductOverride,
      isLocallyDeleted,
    ]
  );

  return (
    <ProductsMutationContext.Provider value={value}>
      {children}
    </ProductsMutationContext.Provider>
  );
}

export function useProductMutations(): ProductsMutationContextValue {
  const context = useContext(ProductsMutationContext);
  if (!context) {
    throw new Error(
      "useProductMutations must be used within a ProductsMutationProvider"
    );
  }
  return context;
}
