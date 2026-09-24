export function ProductTableSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading products">
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
        <div className="grid grid-cols-6 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-slate-200" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-6 gap-4 border-b border-slate-100 px-4 py-4 last:border-0"
          >
            {Array.from({ length: 6 }).map((_, col) => (
              <div
                key={col}
                className="h-4 animate-pulse rounded bg-slate-100"
              />
            ))}
          </div>
        ))}
      </div>
      <div className="grid gap-3 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex gap-3">
              <div className="h-16 w-16 animate-pulse rounded-lg bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading product">
      <div className="h-8 w-1/2 rounded bg-slate-200" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="aspect-square rounded-xl bg-slate-200" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-5/6 rounded bg-slate-100" />
          <div className="h-4 w-2/3 rounded bg-slate-100" />
          <div className="h-10 w-40 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
