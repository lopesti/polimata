"use client";

import { useEffect } from "react";

const KEY = "polimata-settings";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const theme = raw ? (JSON.parse(raw).theme as string) : "system";
      const root = document.documentElement;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = theme === "dark" || (theme === "system" && prefersDark);
      root.classList.toggle("dark", dark);
    } catch {
      /* ignore */
    }
  }, []);

  return <>{children}</>;
}

/** Apply theme immediately (used from config page) */
export function applyTheme(theme: "system" | "light" | "dark") {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  root.classList.toggle("dark", dark);
}
