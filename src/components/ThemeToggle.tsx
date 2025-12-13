"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "theme";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const isDark = theme === "dark";

  const toggle = () => setTheme(isDark ? "light" : "dark");

  const Icon = isDark ? Sun : Moon;

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
