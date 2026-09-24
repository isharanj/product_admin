import { Button } from "@/components/ui/Button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center"
      role="alert"
    >
      <h3 className="text-base font-semibold text-red-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-red-700">{message}</p>
      {onRetry ? (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
