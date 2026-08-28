"use client";

import * as React from "react";
import {
  CalendarPlus,
  Copy,
  Eye,
  FileUp,
  KeyRound,
  MonitorSmartphone,
  Plus,
  ShieldOff,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/data-display/badge";
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
import { Select } from "@/components/ui/inputs/select";
import { Textarea } from "@/components/ui/inputs/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import {
  useIssueLicenseMutation,
  useLicenseInstallationsQuery,
  useLicenses,
  useLicensingOrganizations,
  useLicensingPlans,
  useLicensingSigningKeyQuery,
  useOfflineActivationMutation,
  useRenewLicenseMutation,
  useRevealLicenseKeyMutation,
  useRevokeInstallationMutation,
  useRevokeLicenseMutation,
} from "@/hooks/admin/licensing";
import type {
  LicenseStatusFilter,
  PlatformLicense,
} from "@/lib/admin/services/licensing";
import { useConsoleText } from "@/lib/admin/use-console-text";

const STATUS_BADGE: Record<LicenseStatusFilter, "success" | "error"> = {
  active: "success",
  revoked: "error",
};

/**
 * Perpetual-лицензии проекта: фильтры, выпуск с показом ключа один раз,
 * продление, показ ключа авто-выпуска, офлайн-активация, установки и отзыв.
 */
export function LicensesSection({ canManage }: { canManage: boolean }) {
  const t = useConsoleText();
  const {
    items,
    isPending,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    filters,
    setFilters,
  } = useLicenses();
  const { items: organizations } = useLicensingOrganizations();
  const revokeMutation = useRevokeLicenseMutation();
  const revealMutation = useRevealLicenseKeyMutation();

  const [isIssueOpen, setIsIssueOpen] = React.useState(false);
  const [isSigningKeyOpen, setIsSigningKeyOpen] = React.useState(false);
  const [revealedKey, setRevealedKey] = React.useState<string | null>(null);
  const [renewTarget, setRenewTarget] = React.useState<PlatformLicense | null>(
    null,
  );
  const [offlineTarget, setOfflineTarget] =
    React.useState<PlatformLicense | null>(null);
  const [installationsTarget, setInstallationsTarget] =
    React.useState<PlatformLicense | null>(null);
  const [revokeTarget, setRevokeTarget] =
    React.useState<PlatformLicense | null>(null);

  const statusLabels: Record<LicenseStatusFilter, string> = {
    active: t("console.licensing.licenses.status.active"),
    revoked: t("console.licensing.licenses.status.revoked"),
  };

  return (
    <div className="flex flex-col gap-4" data-testid="licensing-licenses">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="grid max-w-lg grid-cols-2 gap-4">
          <Select
            label={t("console.licensing.licenses.filter.organization")}
            value={filters.organizationId?.toString() ?? ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                organizationId:
                  e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            options={[
              { value: "", label: t("console.licensing.licenses.filter.all") },
              ...organizations.map((org) => ({
                value: String(org.id),
                label: org.name,
              })),
            ]}
            data-testid="licenses-filter-organization"
          />
          <Select
            label={t("console.licensing.licenses.filter.status")}
            value={filters.status ?? ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                status:
                  e.target.value === ""
                    ? undefined
                    : (e.target.value as LicenseStatusFilter),
              })
            }
            options={[
              { value: "", label: t("console.licensing.licenses.filter.all") },
              { value: "active", label: statusLabels.active },
              { value: "revoked", label: statusLabels.revoked },
            ]}
            data-testid="licenses-filter-status"
          />
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outlined"
              shape="circle"
              size="sm"
              startIcon={<KeyRound />}
              onClick={() => setIsSigningKeyOpen(true)}
              data-testid="signing-key-open"
            >
              {t("console.licensing.licenses.signing-key")}
            </Button>
            <Button
              type="button"
              variant="contained"
              color="primary"
              shape="circle"
              size="sm"
              startIcon={<Plus />}
              onClick={() => setIsIssueOpen(true)}
              data-testid="license-issue-open"
            >
              {t("console.licensing.licenses.issue")}
            </Button>
          </div>
        )}
      </div>

      <Table data-testid="licenses-table">
        <TableHeader>
          <TableRow>
            <TableHead>
              {t("console.licensing.licenses.table.organization")}
            </TableHead>
            <TableHead>{t("console.licensing.licenses.table.plan")}</TableHead>
            <TableHead>{t("console.licensing.licenses.table.key")}</TableHead>
            <TableHead>
              {t("console.licensing.licenses.table.entitled-version")}
            </TableHead>
            <TableHead>
              {t("console.licensing.licenses.table.updates-until")}
            </TableHead>
            <TableHead>
              {t("console.licensing.licenses.table.installations")}
            </TableHead>
            <TableHead>
              {t("console.licensing.licenses.table.status")}
            </TableHead>
            <TableHead className="w-32 text-right">
              {t("console.common.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isPending && items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                className="py-8 text-center text-caption text-muted-foreground-lighter"
              >
                {t("console.licensing.licenses.empty")}
              </TableCell>
            </TableRow>
          )}
          {items.map((license) => (
            <TableRow key={license.id} data-license={license.key_prefix}>
              <TableCell className="font-medium">
                {license.organization?.name ?? "—"}
              </TableCell>
              <TableCell>{license.plan?.name ?? "—"}</TableCell>
              <TableCell className="font-mono text-xs">
                {license.key_prefix}…
              </TableCell>
              <TableCell className="font-mono text-xs">
                {license.entitled_version ?? "—"}
              </TableCell>
              <TableCell>{formatDate(license.updates_until)}</TableCell>
              <TableCell>
                {license.active_installations} / {license.max_installations}
              </TableCell>
              <TableCell>
                <Badge
                  color={STATUS_BADGE[license.status]}
                  variant="soft"
                  shape="circle"
                >
                  {statusLabels[license.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <IconButton
                    variant="ghost"
                    size="sm"
                    shape="circle"
                    aria-label={t("console.licensing.licenses.installations")}
                    onClick={() => setInstallationsTarget(license)}
                    data-testid="license-installations-open"
                  >
                    <MonitorSmartphone className="size-4" />
                  </IconButton>
                  {canManage && license.reveal_available && (
                    <IconButton
                      variant="ghost"
                      size="sm"
                      shape="circle"
                      aria-label={t("console.licensing.licenses.reveal")}
                      disabled={revealMutation.isPending}
                      onClick={() =>
                        revealMutation.mutate(license.id, {
                          onSuccess: (revealed) => setRevealedKey(revealed.key),
                        })
                      }
                      data-testid="license-reveal-key"
                    >
                      <Eye className="size-4" />
                    </IconButton>
                  )}
                  {canManage && license.status !== "revoked" && (
                    <>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        shape="circle"
                        aria-label={t("console.licensing.licenses.renew")}
                        onClick={() => setRenewTarget(license)}
                        data-testid="license-renew-open"
                      >
                        <CalendarPlus className="size-4" />
                      </IconButton>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        shape="circle"
                        aria-label={t("console.licensing.licenses.offline")}
                        onClick={() => setOfflineTarget(license)}
                        data-testid="license-offline-open"
                      >
                        <FileUp className="size-4" />
                      </IconButton>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        shape="circle"
                        color="error"
                        aria-label={t("console.licensing.licenses.revoke")}
                        onClick={() => setRevokeTarget(license)}
                      >
                        <ShieldOff className="size-4" />
                      </IconButton>
                    </>
                  )}
                </div>
              </TableCell>
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

      <IssueLicenseDialog
        isOpen={isIssueOpen}
        onClose={() => setIsIssueOpen(false)}
        onIssued={(key) => setRevealedKey(key)}
      />
      <OneTimeKeyDialog
        licenseKey={revealedKey}
        onClose={() => setRevealedKey(null)}
      />
      <RenewLicenseDialog
        license={renewTarget}
        onClose={() => setRenewTarget(null)}
      />
      <OfflineActivationDialog
        license={offlineTarget}
        onClose={() => setOfflineTarget(null)}
      />
      <InstallationsDialog
        license={installationsTarget}
        canManage={canManage}
        onClose={() => setInstallationsTarget(null)}
      />
      <SigningKeyDialog
        isOpen={isSigningKeyOpen}
        canManage={canManage}
        onClose={() => setIsSigningKeyOpen(false)}
      />

      <Dialog
        open={revokeTarget !== null}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
      >
        <DialogContent
          size="sm"
          radius="3xl"
          className="flex flex-col items-center text-center"
        >
          <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldOff className="size-6" />
          </div>
          <DialogTitle className="text-heading-lg font-semibold">
            {t("console.licensing.licenses.revoke.title")}
          </DialogTitle>
          <DialogDescription className="mt-2 max-w-xs text-xs text-muted-foreground leading-relaxed">
            {t("console.licensing.licenses.revoke.description").replace(
              "{key}",
              revokeTarget?.key_prefix ?? "",
            )}
          </DialogDescription>
          <div className="mt-6 grid w-full grid-cols-2 gap-4">
            <Button
              variant="outlined"
              shape="circle"
              size="sm"
              fullWidth
              onClick={() => setRevokeTarget(null)}
            >
              {t("console.common.cancel")}
            </Button>
            <Button
              variant="contained"
              color="error"
              shape="circle"
              size="sm"
              fullWidth
              disabled={revokeMutation.isPending}
              onClick={() => {
                if (!revokeTarget) return;
                revokeMutation.mutate(revokeTarget.id, {
                  onSettled: () => setRevokeTarget(null),
                });
              }}
              data-testid="license-revoke-confirm"
            >
              {t("console.licensing.licenses.revoke")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString("ru-RU") : "—";
}

/** Выпуск лицензии: организация, план, окно обновлений, лимит, версия, заметка. */
function IssueLicenseDialog({
  isOpen,
  onClose,
  onIssued,
}: {
  isOpen: boolean;
  onClose: () => void;
  onIssued: (key: string) => void;
}) {
  const t = useConsoleText();
  const issueMutation = useIssueLicenseMutation();
  const { items: organizations } = useLicensingOrganizations();
  const { items: plans } = useLicensingPlans();

  const [organizationId, setOrganizationId] = React.useState("");
  const [planId, setPlanId] = React.useState("");
  const [updatesUntil, setUpdatesUntil] = React.useState("");
  const [maxInstallations, setMaxInstallations] = React.useState("1");
  const [entitledVersion, setEntitledVersion] = React.useState("");
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (!isOpen) return;
    setOrganizationId("");
    setPlanId("");
    setMaxInstallations("1");
    setEntitledVersion("");
    setNote("");
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setUpdatesUntil(nextYear.toISOString().slice(0, 10));
  }, [isOpen]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (organizationId === "" || planId === "" || updatesUntil === "") return;

    issueMutation.mutate(
      {
        organization_id: Number(organizationId),
        plan_id: Number(planId),
        updates_until: updatesUntil,
        max_installations: Math.max(1, Number(maxInstallations) || 1),
        ...(entitledVersion !== ""
          ? { entitled_version: entitledVersion }
          : {}),
        ...(note !== "" ? { note } : {}),
      },
      {
        onSuccess: (issued) => {
          onClose();
          onIssued(issued.key);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent data-testid="license-issue-form">
        <DialogHeader>
          <DialogTitle>
            {t("console.licensing.licenses.issue.title")}
          </DialogTitle>
          <DialogDescription>
            {t("console.licensing.licenses.issue.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="mt-2 flex flex-col gap-4">
          <Select
            label={t("console.licensing.licenses.issue.organization")}
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
            options={organizations.map((org) => ({
              value: String(org.id),
              label: org.name,
            }))}
            placeholder={t("console.licensing.licenses.filter.all")}
            required
          />
          <Select
            label={t("console.licensing.licenses.issue.plan")}
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            options={plans.map((plan) => ({
              value: String(plan.id),
              label: `${plan.name} (${plan.code})`,
            }))}
            placeholder={t("console.licensing.licenses.filter.all")}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label={t("console.licensing.licenses.issue.updates-until")}
              value={updatesUntil}
              onChange={(e) => setUpdatesUntil(e.target.value)}
              required
            />
            <Input
              type="number"
              min={1}
              label={t("console.licensing.licenses.issue.max-installations")}
              value={maxInstallations}
              onChange={(e) => setMaxInstallations(e.target.value)}
              required
            />
          </div>
          <Input
            label={t("console.licensing.licenses.issue.entitled-version")}
            value={entitledVersion}
            onChange={(e) => setEntitledVersion(e.target.value)}
            placeholder="1.4.7"
            pattern="\d+\.\d+\.\d+"
          />
          <Textarea
            label={t("console.licensing.licenses.issue.note")}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
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
              disabled={issueMutation.isPending}
              data-testid="license-issue-submit"
            >
              {t("console.licensing.licenses.issue")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Полный ключ — единственный показ: после закрытия доступен только префикс. */
function OneTimeKeyDialog({
  licenseKey,
  onClose,
}: {
  licenseKey: string | null;
  onClose: () => void;
}) {
  const t = useConsoleText();

  const copyKey = async () => {
    if (!licenseKey) return;
    await navigator.clipboard.writeText(licenseKey);
    toast.success(t("console.licensing.licenses.toast.key-copied"));
  };

  return (
    <Dialog
      open={licenseKey !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent data-testid="license-key-dialog">
        <DialogHeader>
          <DialogTitle>
            {t("console.licensing.licenses.key-modal.title")}
          </DialogTitle>
          <DialogDescription>
            {t("console.licensing.licenses.key-modal.warning")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-4">
          <code
            className="break-all rounded-xl bg-muted p-4 text-center font-mono text-base tracking-wider"
            data-testid="license-key-value"
          >
            {licenseKey}
          </code>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outlined"
              shape="circle"
              size="sm"
              startIcon={<Copy />}
              onClick={copyKey}
              data-testid="license-key-copy"
            >
              {t("console.licensing.licenses.key-modal.copy")}
            </Button>
            <Button
              type="button"
              variant="contained"
              color="primary"
              shape="circle"
              size="sm"
              onClick={onClose}
            >
              {t("console.common.close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Продление: сдвиг окна обновлений вперёд, ключ и лицензия прежние. */
function RenewLicenseDialog({
  license,
  onClose,
}: {
  license: PlatformLicense | null;
  onClose: () => void;
}) {
  const t = useConsoleText();
  const renewMutation = useRenewLicenseMutation();
  const [updatesUntil, setUpdatesUntil] = React.useState("");

  React.useEffect(() => {
    if (!license) return;
    const base = new Date(license.updates_until);
    base.setFullYear(base.getFullYear() + 1);
    setUpdatesUntil(base.toISOString().slice(0, 10));
  }, [license]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!license || updatesUntil === "") return;

    renewMutation.mutate(
      { id: license.id, input: { updates_until: updatesUntil } },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog
      open={license !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent size="sm" data-testid="license-renew-form">
        <DialogHeader>
          <DialogTitle>
            {t("console.licensing.licenses.renew.title")}
          </DialogTitle>
          <DialogDescription>
            {t("console.licensing.licenses.renew.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="mt-2 flex flex-col gap-4">
          <Input
            type="date"
            label={t("console.licensing.licenses.renew.updates-until")}
            value={updatesUntil}
            onChange={(e) => setUpdatesUntil(e.target.value)}
            required
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
              disabled={renewMutation.isPending}
              data-testid="license-renew-submit"
            >
              {t("console.licensing.licenses.renew")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type OfflineRequestFile = {
  install_id: string;
  domain: string;
  app_version?: string;
};

/** Офлайн-активация: файл-запрос установки → годовой токен файлом клиенту. */
function OfflineActivationDialog({
  license,
  onClose,
}: {
  license: PlatformLicense | null;
  onClose: () => void;
}) {
  const t = useConsoleText();
  const offlineMutation = useOfflineActivationMutation();
  const [request, setRequest] = React.useState<OfflineRequestFile | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (license === null) setRequest(null);
  }, [license]);

  const readFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as OfflineRequestFile;
      if (
        typeof parsed.install_id !== "string" ||
        !/^[0-9a-f]{64}$/.test(parsed.install_id) ||
        typeof parsed.domain !== "string" ||
        parsed.domain === ""
      ) {
        throw new Error("invalid");
      }
      setRequest(parsed);
    } catch {
      setRequest(null);
      toast.error(t("console.licensing.licenses.offline.file-invalid"));
    }
  };

  const submit = () => {
    if (!license || !request) return;

    offlineMutation.mutate(
      {
        id: license.id,
        input: {
          install_id: request.install_id,
          domain: request.domain,
          ...(request.app_version ? { app_version: request.app_version } : {}),
        },
      },
      {
        onSuccess: (result) => {
          downloadTextFile(
            `license-token-${license.key_prefix}.lic`,
            result.token,
          );
          onClose();
        },
      },
    );
  };

  return (
    <Dialog
      open={license !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent data-testid="license-offline-form">
        <DialogHeader>
          <DialogTitle>
            {t("console.licensing.licenses.offline.title")}
          </DialogTitle>
          <DialogDescription>
            {t("console.licensing.licenses.offline.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json,.req"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void readFile(file);
              e.target.value = "";
            }}
            data-testid="license-offline-file"
          />
          <Button
            type="button"
            variant="outlined"
            shape="circle"
            size="sm"
            startIcon={<FileUp />}
            onClick={() => fileInputRef.current?.click()}
          >
            {t("console.licensing.licenses.offline.file")}
          </Button>

          {request && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-xl bg-muted p-4 text-xs">
              <dt className="text-muted-foreground">
                {t("console.licensing.licenses.offline.install-id")}
              </dt>
              <dd className="break-all font-mono">{request.install_id}</dd>
              <dt className="text-muted-foreground">
                {t("console.licensing.licenses.offline.domain")}
              </dt>
              <dd>{request.domain}</dd>
              <dt className="text-muted-foreground">
                {t("console.licensing.licenses.offline.app-version")}
              </dt>
              <dd>{request.app_version ?? "—"}</dd>
            </dl>
          )}

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
              type="button"
              variant="contained"
              color="primary"
              shape="circle"
              size="md"
              disabled={request === null || offlineMutation.isPending}
              onClick={submit}
              data-testid="license-offline-submit"
            >
              {t("console.licensing.licenses.offline.submit")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function downloadTextFile(name: string, contents: string) {
  const url = URL.createObjectURL(
    new Blob([contents], { type: "text/plain;charset=utf-8" }),
  );
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Установки лицензии: телеметрия, фильтр «кто отстал» и отзыв копии. */
function InstallationsDialog({
  license,
  canManage,
  onClose,
}: {
  license: PlatformLicense | null;
  canManage: boolean;
  onClose: () => void;
}) {
  const t = useConsoleText();
  const [appVersionBelow, setAppVersionBelow] = React.useState("");
  const { data: installations, isPending } = useLicenseInstallationsQuery(
    license?.id ?? null,
    appVersionBelow === "" ? undefined : appVersionBelow,
  );
  const revokeMutation = useRevokeInstallationMutation();

  React.useEffect(() => {
    if (license === null) setAppVersionBelow("");
  }, [license]);

  const formatSeen = (value: string | null) =>
    value ? new Date(value).toLocaleString("ru-RU") : "—";

  return (
    <Dialog
      open={license !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent size="lg" data-testid="license-installations-dialog">
        <DialogHeader>
          <DialogTitle>
            {t("console.licensing.licenses.installations.title")}
          </DialogTitle>
          <DialogDescription>
            {license?.key_prefix}… · {license?.active_installations} /{" "}
            {license?.max_installations}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-4">
          <div className="max-w-48">
            <Input
              label={t(
                "console.licensing.licenses.installations.filter.app-version-below",
              )}
              value={appVersionBelow}
              onChange={(e) => setAppVersionBelow(e.target.value)}
              placeholder="1.4.7"
              data-testid="installations-filter-version"
            />
          </div>

          <Table data-testid="installations-table">
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t("console.licensing.licenses.installations.table.domain")}
                </TableHead>
                <TableHead>
                  {t("console.licensing.licenses.installations.table.version")}
                </TableHead>
                <TableHead>
                  {t(
                    "console.licensing.licenses.installations.table.last-seen",
                  )}
                </TableHead>
                <TableHead>
                  {t("console.licensing.licenses.installations.table.status")}
                </TableHead>
                {canManage && (
                  <TableHead className="w-16 text-right">
                    {t("console.common.actions")}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isPending && (installations ?? []).length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={canManage ? 5 : 4}
                    className="py-8 text-center text-caption text-muted-foreground-lighter"
                  >
                    {t("console.licensing.licenses.installations.empty")}
                  </TableCell>
                </TableRow>
              )}
              {(installations ?? []).map((installation) => (
                <TableRow key={installation.id}>
                  <TableCell className="font-medium">
                    {installation.domain}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {installation.app_version ?? "—"}
                  </TableCell>
                  <TableCell>{formatSeen(installation.last_seen_at)}</TableCell>
                  <TableCell>
                    <Badge
                      color={
                        installation.status === "active" ? "success" : "error"
                      }
                      variant="soft"
                      shape="circle"
                    >
                      {installation.status === "active"
                        ? t(
                            "console.licensing.licenses.installations.status.active",
                          )
                        : t(
                            "console.licensing.licenses.installations.status.revoked",
                          )}
                    </Badge>
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      {installation.status === "active" && (
                        <IconButton
                          variant="ghost"
                          size="sm"
                          shape="circle"
                          color="error"
                          aria-label={t(
                            "console.licensing.licenses.installations.revoke",
                          )}
                          disabled={revokeMutation.isPending}
                          onClick={() =>
                            revokeMutation.mutate(installation.id)
                          }
                          data-testid="installation-revoke"
                        >
                          <ShieldOff className="size-4" />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Публичный ключ подписи проекта — только под правом manage. */
function SigningKeyDialog({
  isOpen,
  canManage,
  onClose,
}: {
  isOpen: boolean;
  canManage: boolean;
  onClose: () => void;
}) {
  const t = useConsoleText();
  const { data } = useLicensingSigningKeyQuery(isOpen && canManage);

  const copyKey = async () => {
    if (!data?.public_key) return;
    await navigator.clipboard.writeText(data.public_key);
    toast.success(t("console.licensing.licenses.toast.key-copied"));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent data-testid="signing-key-dialog">
        <DialogHeader>
          <DialogTitle>
            {t("console.licensing.licenses.signing-key.title")}
          </DialogTitle>
          <DialogDescription>
            {t("console.licensing.licenses.signing-key.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-4">
          <code className="break-all rounded-xl bg-muted p-4 font-mono text-xs">
            {data?.public_key ?? t("console.common.loading")}
          </code>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outlined"
              shape="circle"
              size="sm"
              startIcon={<Copy />}
              disabled={!data?.public_key}
              onClick={copyKey}
            >
              {t("console.licensing.licenses.signing-key.copy")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
