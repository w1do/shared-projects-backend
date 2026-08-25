"use client";

import * as React from "react";

import { quickActions, sections } from "@/lib/admin/sidebar-config";
import {
  readSectionSnapshot,
  selectVisibleQuickActions,
  selectVisibleSections,
} from "./section-access";

/**
 * Видимое меню и быстрые действия по снимку доступа оператора.
 *
 * Снимка нет (mock-режим или сессия старше этой возможности) — отдаём каталог
 * как есть: это трактуется как «снимок не готов», а не как «доступа нет».
 * Чтение — в эффекте, как и роль оператора в `AdminSidebar`: localStorage
 * недоступен при серверном рендере.
 */
export function useVisibleNavigation() {
  const [snapshot, setSnapshot] = React.useState<string[] | undefined>(undefined);

  React.useEffect(() => {
    setSnapshot(readSectionSnapshot());
  }, []);

  return React.useMemo(() => {
    if (!snapshot) return { sections, quickActions };

    return {
      sections: selectVisibleSections(sections, snapshot),
      quickActions: selectVisibleQuickActions(quickActions, snapshot),
    };
  }, [snapshot]);
}
