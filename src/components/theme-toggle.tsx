"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

type ThemeToggleProps = {
  compact?: boolean;
  className?: string;
};

export function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to bright theme" : "Switch to dark theme"}
      title={isDark ? "Switch to bright theme" : "Switch to dark theme"}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        compact && "size-11 px-0",
        className
      )}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      {!compact && <span>{isDark ? "Bright theme" : "Dark theme"}</span>}
    </button>
  );
}
