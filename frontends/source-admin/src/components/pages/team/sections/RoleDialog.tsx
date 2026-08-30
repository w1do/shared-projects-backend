"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import { Button } from "@/components/ui/inputs/button";
import { Checkbox } from "@/components/ui/inputs/checkbox";
import { Input } from "@/components/ui/inputs/input";
import type { PermissionGroup, ProjectRole } from "@/lib/admin/types/team";
import { permissionGroupLabel, roleLabel } from "@/lib/admin/role-labels";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface RoleDialogProps {
  isOpen: boolean;
  role: ProjectRole | null;
  groups: PermissionGroup[];
  readOnly: boolean;
  onClose: () => void;
  onSave: (name: string, permissions: string[]) => Promise<void>;
}

/**
 * Роль собирается чекбоксами каталога прав: ключи прав руками не вводят.
 * Системная роль и оператор без права управления открывают диалог на просмотр.
 */
export function RoleDialog({
  isOpen,
  role,
  groups,
  readOnly,
  onClose,
  onSave,
}: RoleDialogProps) {
  const t = useConsoleText();
  const [name, setName] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string>("");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;

    setName(role ? role.name : "");
    setSelected(role ? role.permissions : []);
    setError("");
    setIsSaving(false);
  }, [isOpen, role]);

  const toggle = (key: string) => {
    setSelected((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!role && !name.trim()) {
      setError(t("console.team.role-dialog.name-required"));
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      await onSave(name.trim(), selected);
    } catch (saveError) {
      setError((saveError as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg" scroll>
        <DialogHeader>
          <DialogTitle>
            {role
              ? t("console.team.role-dialog.edit-title").replace("{name}", roleLabel(role.name))
              : t("console.team.role-dialog.create-title")}
          </DialogTitle>
          <DialogDescription>{t("console.team.role-dialog.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2 overflow-hidden">
          <Input
            label={t("console.team.role-dialog.name-label")}
            placeholder={t("console.team.role-dialog.name-placeholder")}
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={error || undefined}
            disabled={readOnly || role !== null}
          />

          <div className="flex flex-col gap-5 overflow-y-auto pr-1">
            {groups.length === 0 && (
              <p className="text-caption text-muted-foreground">
                {t("console.team.role-dialog.empty-catalog")}
              </p>
            )}

            {groups.map((group) => (
              <div key={group.key} className="flex flex-col gap-2">
                <span className="text-caption font-medium text-muted-foreground">
                  {permissionGroupLabel(group.service, group.group)}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.permissions.map((permission) => (
                    <div key={permission.key} className="flex items-center gap-2">
                      <Checkbox
                        id={permission.key}
                        checked={selected.includes(permission.key)}
                        onCheckedChange={() => toggle(permission.key)}
                        disabled={readOnly}
                      />
                      <label
                        htmlFor={permission.key}
                        className="text-caption text-foreground cursor-pointer truncate"
                      >
                        {permission.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outlined" shape="circle" size="md" onClick={onClose}>
              {readOnly ? t("console.common.close") : t("console.common.cancel")}
            </Button>
            {!readOnly && (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                shape="circle"
                size="md"
                disabled={isSaving}
              >
                {t("console.team.role-dialog.submit")}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
