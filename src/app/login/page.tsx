"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/auth/constants";
import { DEMO_CREDENTIALS } from "@/lib/auth/constants";

export default function LoginPage() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      router.replace(ROUTES.products);
    }
  }, [isAuthenticated, isBootstrapping, router]);

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef3f4]">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-teal-700 border-r-transparent"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef3f4] px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(13,148,136,0.12), transparent 40%), radial-gradient(circle at 80% 0%, rgba(15,23,42,0.08), transparent 35%), linear-gradient(180deg, #f8fbfb 0%, #e8eef0 100%)",
        }}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-8 shadow-lg shadow-slate-200/60">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
            Product Admin
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-slate-900">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Use the DummyJSON demo credentials to access the dashboard.
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
          <p className="font-medium text-slate-800">Demo credentials</p>
          <p className="mt-1">
            Username: <code>{DEMO_CREDENTIALS.username}</code>
          </p>
          <p>
            Password: <code>{DEMO_CREDENTIALS.password}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
