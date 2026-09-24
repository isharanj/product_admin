import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
        {props.required ? (
          <span className="text-red-600" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      <input
        id={inputId}
        className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 disabled:bg-slate-50 disabled:text-slate-400 ${
          error ? "border-red-500" : "border-slate-300"
        } ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
        {...props}
      />
      {hint && !error ? (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
