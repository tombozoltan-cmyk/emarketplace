"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useModal } from "@/components/ModalContext";
import { Button, ButtonProps } from "@/components/ui/button";

interface QuoteButtonProps extends ButtonProps {
  packageId?: string;
  children?: React.ReactNode;
}

export function QuoteButton({ packageId, children, ...buttonProps }: QuoteButtonProps) {
  const { openModal } = useModal();
  const pathname = usePathname();
  const isEnglish = pathname?.startsWith("/en");
  const defaultLabel = isEnglish ? "Request a quote" : "Ajánlatot kérek";

  return (
    <Button
      type="button"
      {...buttonProps}
      onClick={(e) => {
        if (buttonProps.onClick) {
          buttonProps.onClick(e);
        }
        if (!e.defaultPrevented) {
          openModal(packageId ? { packageId } : undefined);
        }
      }}
    >
      {children ?? defaultLabel}
    </Button>
  );
}
