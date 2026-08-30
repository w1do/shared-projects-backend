"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/overlay/dialog";
import type { ProjectRole } from "@/lib/admin/types/team";
import { roleLabel } from "@/lib/admin/role-labels";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface DeleteRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  role: ProjectRole | null;
}

export function DeleteRoleDialog({ isOpen, onClose, onConfirm, role }: DeleteRoleDialogProps) {
  const t = useConsoleText();

  if (!role) return null;

  const question = t("console.team.role-delete.question").replace("{name}", roleLabel(role.name));

  return (
    <Dialog open={isOpen} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        size="sm"
        radius="3xl"
        scroll
        className="flex flex-col items-center text-center"
      >
        <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <Trash2 className="size-6" />
        </div>

        <DialogTitle className="text-heading-lg font-semibold">
          {t("console.team.role-delete.title")}
        </DialogTitle>

        <DialogDescription className="mt-2 max-w-xs text-xs text-muted-foreground leading-relaxed">
          {`${question} ${t("console.team.role-delete.irreversible")}`}
        </DialogDescription>

        <div className="mt-6 grid w-full grid-cols-2 gap-4">
          <Button variant="outlined" shape="circle" size="sm" fullWidth onClick={onClose}>
            {t("console.common.cancel")}
          </Button>
          <Button
            variant="contained"
            color="error"
            shape="circle"
            size="sm"
            fullWidth
            onClick={onConfirm}
          >
            {t("console.team.role-delete.confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
