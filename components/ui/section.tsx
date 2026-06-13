import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Container } from "./container";

/** A page section with the Steep ~80px vertical rhythm. */
export function Section({ className, children, ...props }: ComponentProps<"section">) {
  return (
    <section className={cn("py-16 md:py-20", className)} {...props}>
      <Container>{children}</Container>
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

/** Eyebrow + serif display title + supporting copy, reused across sections. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center mx-auto max-w-2xl",
        className,
      )}
    >
      {eyebrow ? (
        <span className="text-caption font-medium uppercase tracking-wide text-terracotta">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-display text-ink text-balance">{title}</h2>
      {description ? (
        <p className="text-body text-muted-stone max-w-xl text-pretty">
          {description}
        </p>
      ) : null}
    </div>
  );
}
