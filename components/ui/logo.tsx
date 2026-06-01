import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Catarina wordmark. A small terracotta leaf mark + the serif name.
 * `tone` flips the text color for dark surfaces.
 */
export function Logo({
  href = "/",
  tone = "ink",
  className,
}: {
  href?: string;
  tone?: "ink" | "canvas";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 font-display text-[1.35rem] leading-none",
        tone === "ink" ? "text-ink" : "text-canvas",
        className,
      )}
    >
      <LeafMark className="size-5 text-terracotta" />
      <span>Catarina</span>
    </Link>
  );
}

function LeafMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M20 4C9 4 4 11 4 20c9 0 16-5 16-16Z"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path
        d="M20 4C9 4 4 11 4 20c9 0 16-5 16-16ZM4 20C8 14 12 11 18 9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
