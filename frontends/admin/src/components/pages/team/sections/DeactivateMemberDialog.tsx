"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/overlay/dialog";
import type { MockUser } from "@/lib/admin/mocks/auth";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface DeactivateMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: MockUser | null;
}

export function DeactivateMemberDialog({
  isOpen,
  onClose,
  onConfirm,
  user,
}: DeactivateMemberDialogProps) {
  const t = useConsoleText();

  if (!user) return null;

  const question = t("console.team.deactivate.question").replace("{name}", user.name);

  return (
    <Dialog open={isOpen} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        size="sm"
        radius="3xl"
        scroll
        className="flex flex-col items-center text-center"
      >
        <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-warning/10 text-warning-dark">
          <AlertTriangle className="size-6" />
        </div>

        <DialogTitle className="text-heading-lg font-semibold">
          {t("console.team.deactivate.title")}
        </DialogTitle>

        <DialogDescription className="mt-2 max-w-xs text-xs text-muted-foreground leading-relaxed">
          {`${question} ${t("console.team.deactivate.consequences")}`}
        </DialogDescription>

        <div className="mt-6 grid w-full grid-cols-2 gap-4">
          <Button variant="outlined" shape="circle" size="sm" fullWidth onClick={onClose}>
            {t("console.common.cancel")}
          </Button>
          <Button
            variant="contained"
            color="warning"
            shape="circle"
            size="sm"
            fullWidth
            onClick={onConfirm}
          >
            {t("console.team.deactivate.confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
