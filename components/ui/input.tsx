import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/lib/cn";

const inputClasses =
  "w-full h-11 px-4 rounded-input bg-canvas text-ink text-body " +
  "border border-hint-of-grey/60 placeholder:text-hint-of-grey " +
  "transition-colors focus:outline-none focus:border-ink " +
  "disabled:opacity-50 disabled:pointer-events-none";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputClasses, className)} {...props} />;
}

interface FieldProps extends Omit<ComponentProps<"input">, "id"> {
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
}

/** Labeled input with optional hint/error text. */
export function Field({ label, hint, error, className, ...props }: FieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-caption font-medium text-ink">
        {label}
      </label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(error ? "border-terracotta focus:border-terracotta" : null, className)}
        {...props}
      />
      {error ? (
        <p className="text-caption text-terracotta">{error}</p>
      ) : hint ? (
        <p className="text-caption text-muted-stone">{hint}</p>
      ) : null}
    </div>
  );
}
