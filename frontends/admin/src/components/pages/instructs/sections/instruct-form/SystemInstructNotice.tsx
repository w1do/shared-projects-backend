"use client";

import { Info } from "lucide-react";
import { Card } from "@/components/ui/data-display/card";
import { Button } from "@/components/ui/inputs/button";
import { useConsoleText } from "@/lib/admin/use-console-text";

type Props = {
  canManage: boolean;
  onDuplicate: () => void;
};

/**
 * Предустановленная инструкция открыта только на чтение: изменить её нельзя,
 * но можно создать свою на её основе.
 */
export function SystemInstructNotice({ canManage, onDuplicate }: Props) {
  const t = useConsoleText();

  return (
    <Card variant="form-section" data-testid="instruct-read-only">
      <div className="flex items-start gap-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Info className="size-4" />
        </div>
        <p className="text-xs text-muted-foreground">{t("console.instructs.read-only")}</p>
      </div>

      {canManage && (
        <Button
          variant="outlined"
          shape="circle"
          size="sm"
          className="w-fit"
          onClick={onDuplicate}
          data-testid="instruct-duplicate"
        >
          {t("console.instructs.duplicate")}
        </Button>
      )}
    </Card>
  );
}
