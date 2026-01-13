"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "theme";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  // Only run on client after mount
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  const isDark = theme === "dark";
  const toggle = () => setTheme(isDark ? "light" : "dark");

  // Always render Moon on server and before mount to avoid hydration mismatch
  const Icon = mounted ? (isDark ? Sun : Moon) : Moon;

  return (
    <button
      type="button"
      onClick={toggle}
      className="group inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--foreground)] hover:bg-[color:var(--primary)]/10 hover:text-[color:var(--primary)] transition"
      aria-label="Téma váltása"
    >
      <Icon
        className="h-5 w-5 text-[color:var(--primary)] transition-transform duration-200 group-hover:rotate-90 group-hover:scale-110"
        strokeWidth={1.9}
      />
    </button>
  );
}
