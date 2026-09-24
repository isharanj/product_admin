import { type SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

export function Select({
  label,
  options,
  error,
  id,
  className = "",
  ...props
}: SelectProps) {
  const selectId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
        {label}
        {props.required ? (
          <span className="text-red-600" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      <select
        id={selectId}
        className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 disabled:bg-slate-50 ${
          error ? "border-red-500" : "border-slate-300"
        } ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
