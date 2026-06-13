import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * Steep cards (DESIGN.md surfaces):
 *  - default:  Canvas + the subtle elevation shadow — primary content container
 *  - fog:      Fog surface, no shadow — quiet secondary container
 *  - warmMist: Warm Mist accent surface, no shadow — featured content
 */
export type CardVariant = "default" | "fog" | "warmMist";

const variants: Record<CardVariant, string> = {
  default: "bg-canvas shadow-subtle",
  fog: "bg-fog",
  warmMist: "bg-warm-mist",
};

interface CardProps extends ComponentProps<"div"> {
  variant?: CardVariant;
}

export function Card({ variant = "default", className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-card p-5", variants[variant], className)}
      {...props}
    />
  );
}
