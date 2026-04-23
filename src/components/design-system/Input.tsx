import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  inputClassName?: string;
  error?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, leftSlot, rightSlot, inputClassName, error, ...props },
  ref
) {
  return (
    <div
      className={cn(
        "flex min-h-10 items-stretch overflow-hidden rounded-md border bg-white transition-colors",
        error ? "border-red-400 focus-within:ring-2 focus-within:ring-red-200" : "border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100",
        className
      )}
    >
      {leftSlot ? (
        <span className="flex shrink-0 items-center pl-3 text-slate-500">{leftSlot}</span>
      ) : null}
      <input
        ref={ref}
        className={cn(
          "min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none",
          leftSlot ? "pl-2" : null,
          rightSlot ? "pr-2" : null,
          inputClassName
        )}
        {...props}
      />
      {rightSlot ? (
        <span className="flex shrink-0 items-center pr-2 text-slate-500">{rightSlot}</span>
      ) : null}
    </div>
  );
});
