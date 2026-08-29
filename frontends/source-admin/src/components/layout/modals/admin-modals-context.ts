"use client";

import { createContext } from "react";

export type AdminModalKey = "inviteMember";

export type AdminModalsState = Record<AdminModalKey, boolean>;

export type AdminModalsContextValue = {
  isOpen: AdminModalsState;
  openModal: (key: AdminModalKey) => void;
  closeModal: (key: AdminModalKey) => void;
};

export const INITIAL_ADMIN_MODALS_STATE: AdminModalsState = {
  inviteMember: false,
};

export const AdminModalsContext = createContext<AdminModalsContextValue | null>(null);
