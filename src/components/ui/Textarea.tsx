import { type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  id,
  className = "",
  ...props
}: TextareaProps) {
  const textareaId =
    id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  const errorId = error ? `${textareaId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={textareaId}
        className="text-sm font-medium text-slate-700"
      >
        {label}
        {props.required ? (
          <span className="text-red-600" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      <textarea
        id={textareaId}
        className={`min-h-28 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 disabled:bg-slate-50 ${
          error ? "border-red-500" : "border-slate-300"
        } ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
