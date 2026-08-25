"use client";

import { AlertCircle, Info } from "lucide-react";

export type CapabilityNoticeProps = {
  /** Short title shown to the buyer. */
  title: string;
  /** Honest explanation of mock vs API limitation. */
  description: string;
  tone?: "info" | "warning";
};

/**
 * Honest empty/capability state for features unavailable in the current data mode.
 * Prefer this over silent nulls or fake success toasts.
 */
export function CapabilityNotice({ title, description, tone = "info" }: CapabilityNoticeProps) {
  const Icon = tone === "warning" ? AlertCircle : Info;
  const surface =
    tone === "warning"
      ? "border-warning/30 bg-accent text-warning-dark"
      : "border-info/20 bg-info-bg/40 text-info";

  return (
    <div className={`flex gap-4 rounded-2xl border p-4 text-left ${surface}`} role="status">
      <Icon className="mt-0 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-caption text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
