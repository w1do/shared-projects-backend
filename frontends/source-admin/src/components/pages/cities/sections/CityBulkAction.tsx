"use client";

import { Button } from "@/components/ui/inputs/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/overlay/alert-dialog";
import { useConsoleText } from "@/lib/admin/use-console-text";

/** Массовое действие с подтверждением: состав городов меняется целиком. */
export function CityBulkAction({
  action,
  title,
  description,
  label,
  disabled,
  onConfirm,
}: {
  action: "enable-all" | "reset";
  title: string;
  description: string;
  label: string;
  disabled: boolean;
  onConfirm: () => void;
}) {
  const t = useConsoleText();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outlined"
          shape="circle"
          size="sm"
          disabled={disabled}
          data-testid={`cities-bulk-${action}`}
        >
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("console.common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            data-testid={`cities-bulk-${action}-confirm`}
          >
            {label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
