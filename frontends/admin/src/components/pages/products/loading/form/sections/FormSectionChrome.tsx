import type { ReactNode } from "react";

/** Shared form-section chrome matching Card variant="form-section". */
export function FormSectionChrome({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-border/40 bg-background p-6 shadow-subtle">
      {children}
    </div>
  );
}
