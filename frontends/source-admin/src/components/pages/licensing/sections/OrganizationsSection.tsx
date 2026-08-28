"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/data-display/table";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import {
  useCreateLicensingOrganizationMutation,
  useDeleteLicensingOrganizationMutation,
  useLicensingOrganizations,
  useUpdateLicensingOrganizationMutation,
} from "@/hooks/admin/licensing";
import type {
  PlatformLicensingOrganization,
  UpsertLicensingOrganizationInput,
} from "@/lib/admin/services/licensing";
import { useConsoleText } from "@/lib/admin/use-console-text";

/** Организации-покупатели: список, анкета в модалке, удаление с подтверждением. */
export function OrganizationsSection({ canManage }: { canManage: boolean }) {
  const t = useConsoleText();
  const { items, isPending, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useLicensingOrganizations();
  const deleteMutation = useDeleteLicensingOrganizationMutation();

  const [formTarget, setFormTarget] = React.useState<
    | { mode: "create" }
    | { mode: "edit"; organization: PlatformLicensingOrganization }
    | null
  >(null);
  const [deleteTarget, setDeleteTarget] =
    React.useState<PlatformLicensingOrganization | null>(null);

  const formatDate = (value: string | null) =>
    value ? new Date(value).toLocaleDateString("ru-RU") : "—";

  return (
    <div className="flex flex-col gap-4" data-testid="licensing-organizations">
      {canManage && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="contained"
            color="primary"
            shape="circle"
            size="sm"
            startIcon={<Plus />}
            onClick={() => setFormTarget({ mode: "create" })}
            data-testid="organization-add"
          >
            {t("console.licensing.organizations.add")}
          </Button>
        </div>
      )}

      <Table data-testid="organizations-table">
        <TableHeader>
          <TableRow>
            <TableHead>
              {t("console.licensing.organizations.table.name")}
            </TableHead>
            <TableHead>
              {t("console.licensing.organizations.table.contact")}
            </TableHead>
            <TableHead>
              {t("console.licensing.organizations.table.email")}
            </TableHead>
            <TableHead>
              {t("console.licensing.organizations.table.phone")}
            </TableHead>
            <TableHead>
              {t("console.licensing.organizations.table.created")}
            </TableHead>
            {canManage && (
              <TableHead className="w-24 text-right">
                {t("console.common.actions")}
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isPending && items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={canManage ? 6 : 5}
                className="py-8 text-center text-caption text-muted-foreground-lighter"
              >
                {t("console.licensing.organizations.empty")}
              </TableCell>
            </TableRow>
          )}
          {items.map((organization) => (
            <TableRow key={organization.id} data-organization={organization.id}>
              <TableCell className="font-medium">{organization.name}</TableCell>
              <TableCell>
                {`${organization.contact_first_name} ${organization.contact_last_name}`.trim()}
              </TableCell>
              <TableCell>{organization.email}</TableCell>
              <TableCell>{organization.phone ?? "—"}</TableCell>
              <TableCell>{formatDate(organization.created_at)}</TableCell>
              {canManage && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <IconButton
                      variant="ghost"
                      size="sm"
                      shape="circle"
                      aria-label={t("console.common.edit")}
                      onClick={() =>
                        setFormTarget({ mode: "edit", organization })
                      }
                    >
                      <Pencil className="size-4" />
                    </IconButton>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      shape="circle"
                      color="error"
                      aria-label={t("console.common.delete")}
                      onClick={() => setDeleteTarget(organization)}
                    >
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outlined"
            shape="circle"
            size="sm"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {t("console.licensing.load-more")}
          </Button>
        </div>
      )}

      <OrganizationFormDialog
        target={formTarget}
        onClose={() => setFormTarget(null)}
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent
          size="sm"
          radius="3xl"
          className="flex flex-col items-center text-center"
        >
          <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Trash2 className="size-6" />
          </div>
          <DialogTitle className="text-heading-lg font-semibold">
            {t("console.licensing.organizations.delete.title")}
          </DialogTitle>
          <DialogDescription className="mt-2 max-w-xs text-xs text-muted-foreground leading-relaxed">
            {t("console.licensing.organizations.delete.description").replace(
              "{name}",
              deleteTarget?.name ?? "",
            )}
          </DialogDescription>
          <div className="mt-6 grid w-full grid-cols-2 gap-4">
            <Button
              variant="outlined"
              shape="circle"
              size="sm"
              fullWidth
              onClick={() => setDeleteTarget(null)}
            >
              {t("console.common.cancel")}
            </Button>
            <Button
              variant="contained"
              color="error"
              shape="circle"
              size="sm"
              fullWidth
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (!deleteTarget) return;
                deleteMutation.mutate(deleteTarget.id, {
                  onSettled: () => setDeleteTarget(null),
                });
              }}
              data-testid="organization-delete-confirm"
            >
              {t("console.common.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Анкета организации: одна форма на создание и редактирование. */
function OrganizationFormDialog({
  target,
  onClose,
}: {
  target:
    | { mode: "create" }
    | { mode: "edit"; organization: PlatformLicensingOrganization }
    | null;
  onClose: () => void;
}) {
  const t = useConsoleText();
  const createMutation = useCreateLicensingOrganizationMutation();
  const updateMutation = useUpdateLicensingOrganizationMutation();

  const editing = target?.mode === "edit" ? target.organization : null;

  const [name, setName] = React.useState("");
  const [contactFirstName, setContactFirstName] = React.useState("");
  const [contactLastName, setContactLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [telegram, setTelegram] = React.useState("");
  const [activity, setActivity] = React.useState("");
  const [employeesCount, setEmployeesCount] = React.useState("");
  const [usagePurpose, setUsagePurpose] = React.useState("");

  React.useEffect(() => {
    if (target === null) return;
    setName(editing?.name ?? "");
    setContactFirstName(editing?.contact_first_name ?? "");
    setContactLastName(editing?.contact_last_name ?? "");
    setEmail(editing?.email ?? "");
    setPhone(editing?.phone ?? "");
    setTelegram(editing?.telegram ?? "");
    setActivity(editing?.activity ?? "");
    setEmployeesCount(editing?.employees_count?.toString() ?? "");
    setUsagePurpose(editing?.usage_purpose ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const input: UpsertLicensingOrganizationInput = {
      name: name.trim(),
      contact_first_name: contactFirstName.trim(),
      contact_last_name: contactLastName.trim(),
      email: email.trim(),
      phone: phone.trim() === "" ? null : phone.trim(),
      telegram: telegram.trim() === "" ? null : telegram.trim(),
      activity: activity.trim() === "" ? null : activity.trim(),
      employees_count:
        employeesCount.trim() === "" ? null : Number(employeesCount),
      usage_purpose: usagePurpose.trim() === "" ? null : usagePurpose.trim(),
    };

    const options = { onSuccess: onClose };
    if (editing) {
      updateMutation.mutate({ id: editing.id, input }, options);
    } else {
      createMutation.mutate(input, options);
    }
  };

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent scroll data-testid="organization-form">
        <DialogHeader>
          <DialogTitle>
            {editing
              ? t("console.licensing.organizations.form.edit-title")
              : t("console.licensing.organizations.form.create-title")}
          </DialogTitle>
          <DialogDescription>
            {t("console.licensing.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="mt-2 flex flex-col gap-4">
          <Input
            label={t("console.licensing.organizations.form.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t(
                "console.licensing.organizations.form.contact-first-name",
              )}
              value={contactFirstName}
              onChange={(e) => setContactFirstName(e.target.value)}
              required
            />
            <Input
              label={t(
                "console.licensing.organizations.form.contact-last-name",
              )}
              value={contactLastName}
              onChange={(e) => setContactLastName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="email"
              label={t("console.licensing.organizations.form.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label={t("console.licensing.organizations.form.phone")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("console.licensing.organizations.form.telegram")}
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
            />
            <Input
              type="number"
              min={0}
              label={t("console.licensing.organizations.form.employees-count")}
              value={employeesCount}
              onChange={(e) => setEmployeesCount(e.target.value)}
            />
          </div>
          <Input
            label={t("console.licensing.organizations.form.activity")}
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
          />
          <Textarea
            label={t("console.licensing.organizations.form.usage-purpose")}
            value={usagePurpose}
            onChange={(e) => setUsagePurpose(e.target.value)}
            rows={3}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outlined"
              shape="circle"
              size="md"
              onClick={onClose}
            >
              {t("console.common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              shape="circle"
              size="md"
              disabled={isPending}
              data-testid="organization-form-submit"
            >
              {t("console.common.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
