import Link from "next/link";
import { ROUTES } from "@/lib/auth/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7f8] px-4">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          The page you requested does not exist.
        </p>
        <Link
          href={ROUTES.products}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-800"
        >
          Back to Products
        </Link>
      </div>
    </div>
  );
}
