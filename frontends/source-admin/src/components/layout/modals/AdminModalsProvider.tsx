"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";

import {
  AdminModalsContext,
  INITIAL_ADMIN_MODALS_STATE,
  type AdminModalKey,
  type AdminModalsState,
} from "./admin-modals-context";

export function AdminModalsProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState<AdminModalsState>(INITIAL_ADMIN_MODALS_STATE);

  const openModal = useCallback((key: AdminModalKey) => {
    setIsOpen((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);

  const closeModal = useCallback((key: AdminModalKey) => {
    setIsOpen((prev) => (prev[key] ? { ...prev, [key]: false } : prev));
  }, []);

  const value = useMemo(() => ({ isOpen, openModal, closeModal }), [isOpen, openModal, closeModal]);

  return <AdminModalsContext.Provider value={value}>{children}</AdminModalsContext.Provider>;
}
