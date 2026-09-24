import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-slate-600">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <Button variant="secondary" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
