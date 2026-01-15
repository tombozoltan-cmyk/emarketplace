"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ModalData = {
  packageId?: string;
  [key: string]: unknown;
};

type ModalContextValue = {
  isOpen: boolean;
  openModal: (data?: ModalData) => void;
  closeModal: () => void;
  modalData: ModalData | null;
};

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);

  const openModal = useCallback((data?: ModalData) => {
    setModalData(data ?? null);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({ isOpen, openModal, closeModal, modalData }),
    [isOpen, openModal, closeModal, modalData],
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return ctx;
}
