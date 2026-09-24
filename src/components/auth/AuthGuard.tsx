"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/auth/constants";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      router.replace(
        `${ROUTES.login}?next=${encodeURIComponent(pathname || ROUTES.products)}`
      );
    }
  }, [isAuthenticated, isBootstrapping, pathname, router]);

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f8]">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-teal-700 border-r-transparent"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
