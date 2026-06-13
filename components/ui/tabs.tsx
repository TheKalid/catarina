"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  key: string;
  label: string;
  content: ReactNode;
}

/**
 * Accessible underline tabs (WAI-ARIA tabs pattern): roving tabindex, arrow /
 * Home / End keyboard navigation, and proper tab/tabpanel wiring. All panels
 * stay mounted (toggled with `hidden`) so switching is instant and child state
 * — chart hover, fetched lists — is preserved.
 */
export function Tabs({ tabs, className }: { tabs: TabItem[]; className?: string }) {
  const [active, setActive] = useState(tabs[0]?.key);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent, index: number) {
    const last = tabs.length - 1;
    let next = -1;
    if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next >= 0) {
      event.preventDefault();
      setActive(tabs[next].key);
      tabRefs.current[next]?.focus();
    }
  }

  return (
    <div className={className}>
      <div role="tablist" aria-label="Device sections" className="flex gap-6 border-b border-ink/10">
        {tabs.map((tab, index) => {
          const selected = tab.key === active;
          return (
            <button
              key={tab.key}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${tab.key}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.key)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={cn(
                "-mb-px cursor-pointer border-b-2 pb-3 pt-1 text-body transition-colors",
                "focus-visible:outline-none focus-visible:text-ink",
                selected
                  ? "border-terracotta text-ink font-medium"
                  : "border-transparent text-muted-stone hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.key}
          role="tabpanel"
          id={`${baseId}-panel-${tab.key}`}
          aria-labelledby={`${baseId}-tab-${tab.key}`}
          hidden={tab.key !== active}
          className="pt-6"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
