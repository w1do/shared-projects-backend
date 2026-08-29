"use client";

import * as React from "react";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { useCreateProjectMutation } from "@/hooks/admin/project";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

/**
 * Создание проекта по одному названию: ключ выводит платформа.
 * Отказ платформы оставляет диалог открытым с введённым названием.
 */
export function CreateProjectDialog({ open, onClose, onCreated }: Props) {
  const t = useConsoleText();
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const create = useCreateProjectMutation();

  React.useEffect(() => {
    if (!open) {
      setName("");
      setError(null);
    }
  }, [open]);

  const submit = () => {
    // Пустое название отклоняется до отправки запроса.
    if (name.trim() === "") {
      setError(t("console.project.create.name-required"));
      return;
    }

    setError(null);
    create.mutate(name.trim(), {
      onSuccess: onCreated,
      onError: (reason: Error) =>
        setError(reason.message || t("console.project.create.failed")),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !create.isPending && onClose()}>
      <DialogContent size="sm" radius="3xl" scroll data-testid="create-project-dialog">
        <DialogTitle className="text-heading-lg font-semibold">
          {t("console.project.create.title")}
        </DialogTitle>
        <DialogDescription className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {t("console.project.create.subtitle")}
        </DialogDescription>

        <div className="mt-4">
          <Input
            label={t("console.project.name")}
            value={name}
            error={error ?? undefined}
            disabled={create.isPending}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && submit()}
            data-testid="create-project-name"
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Button
            variant="outlined"
            shape="circle"
            size="sm"
            fullWidth
            disabled={create.isPending}
            onClick={onClose}
          >
            {t("console.common.cancel")}
          </Button>
          <Button
            shape="circle"
            size="sm"
            fullWidth
            isLoading={create.isPending}
            onClick={submit}
            data-testid="create-project-submit"
          >
            {t("console.common.create")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
