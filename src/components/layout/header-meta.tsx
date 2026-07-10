"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const PAGE_NAMES: Record<string, string> = {
  "/planner": "Weekly Planner",
  "/sessions": "Session Logger",
  "/drills": "Drill Library",
  "/goals": "Goals",
  "/dashboard": "Progress",
  "/settings": "Settings",
};

export function HeaderMeta() {
  const pathname = usePathname();
  const title = PAGE_NAMES[pathname] ?? "Fairway";

  const dateStr = React.useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    [],
  );

  return (
    <div className="flex flex-1 items-center justify-between">
      <span className="text-[11px] font-extrabold uppercase tracking-[.18em] text-foreground">
        {title}
      </span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="font-mono text-[12px] font-semibold text-muted-foreground">
            {dateStr}
          </span>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
