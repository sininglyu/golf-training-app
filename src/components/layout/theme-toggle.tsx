"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-8 w-8 items-center justify-center rounded-[7px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Sun className="h-[15px] w-[15px] scale-100 dark:scale-0 dark:opacity-0 transition-all" />
      <Moon className="absolute h-[15px] w-[15px] scale-0 opacity-0 dark:scale-100 dark:opacity-100 transition-all" />
    </button>
  );
}
