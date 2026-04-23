import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary:
    "border border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500",
  success:
    "border border-emerald-600 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50",
  secondary:
    "border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400",
  outline:
    "border border-slate-300 bg-transparent text-slate-800 hover:border-slate-400 hover:bg-slate-50",
  ghost: "border border-transparent text-slate-700 hover:bg-slate-100",
  link: "border-0 bg-transparent p-0 text-blue-700 underline-offset-2 hover:underline",
} as const;

const sizes = {
  sm: "min-h-8 gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold",
  md: "min-h-10 gap-2 rounded-md px-4 py-2 text-sm font-semibold",
  lg: "min-h-12 gap-2 rounded-md px-6 py-2.5 text-sm font-semibold",
  xl: "min-h-14 gap-2 rounded-lg px-8 py-3 text-base font-bold",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, type = "button", children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex select-none items-center justify-center font-medium transition-colors disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
