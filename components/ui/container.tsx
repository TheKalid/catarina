import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Max-width (1280px) page gutter wrapper. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-page px-6 md:px-8", className)}
      {...props}
    />
  );
}
