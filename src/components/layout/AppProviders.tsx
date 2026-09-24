"use client";

import { AuthProvider } from "@/hooks/useAuth";
import { ProductsMutationProvider } from "@/context/ProductsMutationProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProductsMutationProvider>{children}</ProductsMutationProvider>
    </AuthProvider>
  );
}
