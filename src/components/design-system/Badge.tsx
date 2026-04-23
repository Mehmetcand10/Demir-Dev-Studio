import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const badgeVariants = {
  default: "border-slate-200 bg-slate-100 text-slate-800",
  primary: "border-blue-200 bg-blue-50 text-blue-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  danger: "border-red-200 bg-red-50 text-red-900",
  stock: "border-slate-200 bg-white font-semibold text-slate-800",
} as const;

export type BadgeVariant = keyof typeof badgeVariants;

export function Badge({
  className,
  children,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium",
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
