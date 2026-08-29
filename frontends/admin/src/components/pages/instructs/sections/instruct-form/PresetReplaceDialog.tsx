"use client";

import { Button } from "@/components/ui/inputs/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import { useConsoleText } from "@/lib/admin/use-console-text";
import type { PlatformSchemaPreset } from "@/lib/admin/services";

type Props = {
  preset: PlatformSchemaPreset | null;
  onClose: () => void;
  onConfirm: () => void;
};

/** Пресет заменяет уже заданные поля только после явного подтверждения. */
export function PresetReplaceDialog({ preset, onClose, onConfirm }: Props) {
  const t = useConsoleText();

  return (
    <Dialog open={preset !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        size="sm"
        radius="3xl"
        scroll
        className="flex flex-col items-center text-center"
        data-testid="schema-preset-replace"
      >
        <DialogTitle className="text-heading-lg font-semibold">
          {t("console.instructs.schema.preset-replace-title")}
        </DialogTitle>

        <DialogDescription className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
          {t("console.instructs.schema.preset-replace-question").replace(
            "{name}",
            preset?.title ?? "",
          )}
        </DialogDescription>

        <div className="mt-6 grid w-full grid-cols-2 gap-4">
          <Button variant="outlined" shape="circle" size="sm" fullWidth onClick={onClose}>
            {t("console.common.cancel")}
          </Button>
          <Button
            variant="contained"
            shape="circle"
            size="sm"
            fullWidth
            onClick={onConfirm}
            data-testid="schema-preset-confirm"
          >
            {t("console.instructs.schema.preset-apply")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
