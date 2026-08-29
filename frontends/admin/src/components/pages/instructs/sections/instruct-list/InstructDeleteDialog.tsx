"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import { useConsoleText } from "@/lib/admin/use-console-text";
import type { PlatformInstruct } from "@/lib/admin/services";

type Props = {
  instruct: PlatformInstruct | null;
  isBusy: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

/** Подтверждение удаления инструкции — тот же диалог, что и в остальных разделах. */
export function InstructDeleteDialog({ instruct, isBusy, onClose, onConfirm }: Props) {
  const t = useConsoleText();

  return (
    <Dialog open={instruct !== null} onOpenChange={(open) => !open && !isBusy && onClose()}>
      <DialogContent
        size="sm"
        radius="3xl"
        scroll
        className="flex flex-col items-center text-center"
        data-testid="instruct-delete-dialog"
      >
        <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <Trash2 className="size-6" />
        </div>

        <DialogTitle className="text-heading-lg font-semibold">
          {t("console.instructs.delete.title")}
        </DialogTitle>

        <DialogDescription className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
          {t("console.instructs.delete.question").replace("{name}", instruct?.title ?? "")}
        </DialogDescription>

        <div className="mt-6 grid w-full grid-cols-2 gap-4">
          <Button
            variant="outlined"
            shape="circle"
            size="sm"
            fullWidth
            disabled={isBusy}
            onClick={onClose}
          >
            {t("console.common.cancel")}
          </Button>
          <Button
            variant="contained"
            color="error"
            shape="circle"
            size="sm"
            fullWidth
            isLoading={isBusy}
            onClick={onConfirm}
            data-testid="instruct-delete-confirm"
          >
            {t("console.instructs.delete")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
