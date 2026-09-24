"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-teal-700 text-white hover:bg-teal-800 focus-visible:ring-teal-600 disabled:bg-teal-700/60",
  secondary:
    "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400 disabled:text-slate-400",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 disabled:bg-red-600/60",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400 disabled:text-slate-400",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      className = "",
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type="button"
        className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
            aria-hidden="true"
          />
        ) : null}
        {children}
      </button>
    );
  }
);
