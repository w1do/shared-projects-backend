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
      toast.error("Please enter a name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    onAdd(name.trim(), email.trim().toLowerCase(), role);
    onClose();
  };

  const roleOptions = React.useMemo(() => {
    if (currentUserRole === "manager") {
      return [{ value: "staff", label: "Staff" }];
    }
    return [
      { value: "admin", label: "Admin" },
      { value: "manager", label: "Manager" },
      { value: "staff", label: "Staff" },
    ];
  }, [currentUserRole]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite teammate</DialogTitle>
          <DialogDescription>Send an invitation to join the admin workspace.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <Input
            label="Full name"
            placeholder="John Doe"
            startIcon={<UserRound />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            type="email"
            label="Work email"
            placeholder="john@aetheria.com"
            startIcon={<Mail />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "manager" | "staff")}
            options={roleOptions}
            placeholder="Select a role"
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outlined" shape="circle" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" shape="circle" size="md">
              Send invite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
