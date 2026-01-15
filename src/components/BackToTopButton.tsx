"use client";

import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";

const SHOW_AFTER_PX = 500;

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;

    const update = () => {
      rafId = null;
      setIsVisible(window.scrollY >= SHOW_AFTER_PX);
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 right-5 z-40 md:bottom-6 md:right-6">
      <Button
        type="button"
        size="icon"
        aria-label="Vissza a lap tetejére"
        onClick={handleClick}
        className="rounded-full shadow-lg"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
}
