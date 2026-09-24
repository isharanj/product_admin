"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/auth/constants";
import { Button } from "@/components/ui/Button";

const navItems = [
  { href: ROUTES.products, label: "Products" },
  { href: ROUTES.productNew, label: "Add Product" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f7f8] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              <span aria-hidden="true">{mobileOpen ? "✕" : "☰"}</span>
            </button>
            <Link
              href={ROUTES.products}
              className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-slate-900"
            >
              Product Admin
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden items-center gap-2 sm:flex">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.image}
                  alt=""
                  className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                />
                <div className="text-sm leading-tight">
                  <p className="font-medium text-slate-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-slate-500">@{user.username}</p>
                </div>
              </div>
            ) : null}
            <Button variant="secondary" size="sm" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside
          className={`fixed inset-y-14 left-0 z-20 w-64 border-r border-slate-200 bg-white p-4 transition-transform lg:static lg:inset-auto lg:translate-x-0 lg:rounded-xl lg:border lg:self-start ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Management
          </p>
          <nav className="flex flex-col gap-1" aria-label="Main">
            {navItems.map((item) => {
              const active =
                item.href === ROUTES.products
                  ? pathname.startsWith("/products") &&
                    !pathname.startsWith(ROUTES.productNew)
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-teal-50 text-teal-800"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-10 bg-slate-900/30 lg:hidden"
            aria-label="Close menu overlay"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
