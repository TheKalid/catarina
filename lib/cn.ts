/**
 * Tiny classname joiner. Filters falsy values so conditional classes read
 * cleanly: `cn("base", active && "is-active", disabled ? "opacity-50" : null)`.
 * Intentionally not a tailwind-merge — our components own their class sets, so
 * a join is enough and keeps the dependency surface small.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
