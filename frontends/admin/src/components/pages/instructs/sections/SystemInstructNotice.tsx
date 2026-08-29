"use client";

import { Button } from "@/components/ui/inputs/button";
import { t } from "@/lib/admin/console-texts";

type Props = {
  canManage: boolean;
  onDuplicate: () => void;
};

/**
 * Предустановленная инструкция открыта только на чтение: изменить её нельзя,
 * но можно создать свою на её основе.
 */
export function SystemInstructNotice({ canManage, onDuplicate }: Props) {
  return (
    <div className="rounded-2xl bg-muted p-4" data-testid="instruct-read-only">
      <p className="text-caption text-muted-foreground">
        {t("console.instructs.read-only")}
      </p>

      {canManage && (
        <Button
          variant="outlined"
          size="sm"
          className="mt-4"
          onClick={onDuplicate}
          data-testid="instruct-duplicate"
        >
          {t("console.instructs.duplicate")}
        </Button>
      )}
    </div>
  );
}
