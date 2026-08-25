"use client";

import { useEffect } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/inputs/textarea";
import type { TeamMember } from "@/lib/admin/mocks/settings";
import {
  defaultInviteMemberFormValues,
  inviteMemberSchema,
  type InviteMemberFormValues,
} from "@/lib/admin/schemas/content/invite-member-schema";
import { TEAM_ROLE_OPTIONS } from "@/components/pages/settings/config/options";

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvited?: (member: TeamMember) => void;
}

export function InviteMemberDialog({ isOpen, onClose, onInvited }: InviteMemberDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema) as Resolver<InviteMemberFormValues>,
    defaultValues: defaultInviteMemberFormValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(defaultInviteMemberFormValues);
  }, [isOpen, reset]);

  const submit = (values: InviteMemberFormValues) => {
    const member: TeamMember = {
      id: `u-${Date.now()}`,
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      role: values.role,
      status: "invited",
    };

    onInvited?.(member);
    toast.success(`Invitation sent to ${member.email}`, {
      description: `${member.name} joined as ${member.role}. Connect your backend to deliver real invites.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Send a workspace invite with a role. They will appear as Invited until they accept.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
          <Input
            label="Full name"
            placeholder="Sofia Rossi"
            startIcon={<UserRound />}
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            type="email"
            label="Work email"
            placeholder="sofia@aetheria.studio"
            startIcon={<Mail />}
            error={errors.email?.message}
            {...register("email")}
          />

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                label="Role"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                options={TEAM_ROLE_OPTIONS}
                placeholder="Select a role"
                error={errors.role?.message}
              />
            )}
          />

          <Textarea
            label="Personal note (optional)"
            placeholder="Welcome to the Aetheria admin — start with Orders and Campaigns."
            rows={3}
            error={errors.note?.message}
            {...register("note")}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outlined"
              shape="circle"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              shape="circle"
              size="md"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending…" : "Send invite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
