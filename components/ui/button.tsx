import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * Steep buttons are pill-shaped (DESIGN.md). Variants:
 *  - primary:    filled Ink, Canvas text — the main CTA
 *  - ghost:      transparent, Ink border + text — secondary action
 *  - ghostLight: transparent, Canvas border + text — for dark backgrounds
 *  - link:       text-only, no padding/border — inline navigation
 */
export type ButtonVariant = "primary" | "ghost" | "ghostLight" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-medium " +
  "whitespace-nowrap transition-colors duration-150 cursor-pointer " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas " +
  "disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-canvas hover:bg-ink/90",
  ghost: "border border-ink text-ink hover:bg-ink/5",
  ghostLight: "border border-canvas text-canvas hover:bg-canvas/10",
  link: "text-ink underline-offset-4 hover:underline !px-0 !h-auto",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-caption",
  md: "h-11 px-5 text-body",
  lg: "h-13 px-6 text-body",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className);
}

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonOwnProps & ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}

/** Same styling as {@link Button}, rendered as a Next.js `<Link>`. */
export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ButtonOwnProps & ComponentProps<typeof Link>) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
