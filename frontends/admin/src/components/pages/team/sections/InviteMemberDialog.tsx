"use client";

import * as React from "react";
import { Mail, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, email: string, role: "admin" | "manager" | "staff") => void;
  currentUserRole: string;
}

export function InviteMemberDialog({
  isOpen,
  onClose,
  onAdd,
  currentUserRole,
}: InviteMemberDialogProps) {
  const t = useConsoleText();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<"admin" | "manager" | "staff">("staff");

  React.useEffect(() => {
    if (isOpen) {
      setName("");
      setEmail("");
      setRole("staff");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t("console.team.validation.name-required"));
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error(t("console.team.validation.email-format"));
      return;
    }

    onAdd(name.trim(), email.trim().toLowerCase(), role);
    onClose();
  };

  const roleOptions = React.useMemo(() => {
    if (currentUserRole === "manager") {
      return [{ value: "staff", label: t("console.team.role.staff") }];
    }
    return [
      { value: "admin", label: t("console.team.role.admin") },
      { value: "manager", label: t("console.team.role.manager") },
      { value: "staff", label: t("console.team.role.staff") },
    ];
  }, [currentUserRole, t]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("console.team.invite.title")}</DialogTitle>
          <DialogDescription>{t("console.team.invite.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <Input
            label={t("console.team.invite.name-label")}
            placeholder={t("console.team.invite.name-placeholder")}
            startIcon={<UserRound />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            type="email"
            label={t("console.team.invite.email-label")}
            placeholder={t("console.team.invite.email-placeholder")}
            startIcon={<Mail />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Select
            label={t("console.team.invite.role-label")}
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "manager" | "staff")}
            options={roleOptions}
            placeholder={t("console.team.invite.role-placeholder")}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outlined" shape="circle" size="md" onClick={onClose}>
              {t("console.common.cancel")}
            </Button>
            <Button type="submit" variant="contained" color="primary" shape="circle" size="md">
              {t("console.team.invite.submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
