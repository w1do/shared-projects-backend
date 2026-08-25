"use client";

import { useContext } from "react";

import { AdminModalsContext } from "./admin-modals-context";

export function useAdminModals() {
  const context = useContext(AdminModalsContext);
  if (!context) {
    throw new Error("useAdminModals must be used within AdminModalsProvider");
  }
  return context;
}
