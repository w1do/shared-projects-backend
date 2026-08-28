"use client";

import * as React from "react";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/inputs/checkbox";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/inputs/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import {
  useCreateReleaseMutation,
  useDeleteReleaseMutation,
  useLicensingReleases,
  useUpdateReleaseMutation,
} from "@/hooks/admin/licensing";
import type { PlatformLicensingRelease } from "@/lib/admin/services/licensing";
import { useConsoleText } from "@/lib/admin/use-console-text";

/** Каталог релизов поставки: источник правды для прав на версии и обновлений. */
export function ReleasesSection({ canManage }: { canManage: boolean }) {
  const t = useConsoleText();
  const { items, isPending, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useLicensingReleases();
  const deleteMutation = useDeleteReleaseMutation();

  const [formTarget, setFormTarget] = React.useState<
    PlatformLicensingRelease | "create" | null
  >(null);
  const [deleteTarget, setDeleteTarget] =
    React.useState<PlatformLicensingRelease | null>(null);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("ru-RU");

  return (
    <div className="flex flex-col gap-4" data-testid="licensing-releases">
      {canManage && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="contained"
            color="primary"
            shape="circle"
            size="sm"
            startIcon={<Plus />}
            onClick={() => setFormTarget("create")}
            data-testid="release-add"
          >
            {t("console.licensing.releases.add")}
          </Button>
        </div>
      )}

      <Table data-testid="releases-table">
        <TableHeader>
          <TableRow>
            <TableHead>
              {t("console.licensing.releases.table.version")}
            </TableHead>
            <TableHead>{t("console.licensing.releases.table.train")}</TableHead>
            <TableHead>
              {t("console.licensing.releases.table.repository")}
            </TableHead>
            <TableHead>
              {t("console.licensing.releases.table.released")}
            </TableHead>
            <TableHead>
              {t("console.licensing.releases.table.security")}
            </TableHead>
            <TableHead>
              {t("console.licensing.releases.table.changelog")}
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
                colSpan={canManage ? 7 : 6}
                className="py-8 text-center text-caption text-muted-foreground-lighter"
              >
                {t("console.licensing.releases.empty")}
              </TableCell>
            </TableRow>
          )}
          {items.map((release) => (
            <TableRow key={release.id} data-release={release.version}>
              <TableCell className="font-mono text-xs font-medium">
                {release.version}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {release.train}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {release.repository}
              </TableCell>
              <TableCell>{formatDate(release.released_at)}</TableCell>
              <TableCell>
                {release.is_security ? (
                  <Badge color="warning" variant="soft" shape="circle">
                    {t("console.licensing.releases.security.badge")}
                  </Badge>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                {release.changelog_url ? (
                  <a
                    href={release.changelog_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <ExternalLink className="size-3.5" />
                    {t("console.licensing.releases.table.changelog")}
                  </a>
                ) : (
                  "—"
                )}
              </TableCell>
              {canManage && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <IconButton
                      variant="ghost"
                      size="sm"
                      shape="circle"
                      aria-label={t(
                        "console.licensing.releases.form.edit-title",
                      )}
                      onClick={() => setFormTarget(release)}
                      data-testid="release-edit"
                    >
                      <Pencil className="size-4" />
                    </IconButton>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      shape="circle"
                      color="error"
                      aria-label={t("console.licensing.releases.delete.title")}
                      onClick={() => setDeleteTarget(release)}
                      data-testid="release-delete"
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

      <ReleaseFormDialog
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
            {t("console.licensing.releases.delete.title")}
          </DialogTitle>
          <DialogDescription className="mt-2 max-w-xs text-xs text-muted-foreground leading-relaxed">
            {t("console.licensing.releases.delete.description").replace(
              "{version}",
              deleteTarget?.version ?? "",
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
              data-testid="release-delete-confirm"
            >
              {t("console.licensing.releases.delete.title")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Создание/редактирование релиза; дубликат версии показывает доменную ошибку. */
function ReleaseFormDialog({
  target,
  onClose,
}: {
  target: PlatformLicensingRelease | "create" | null;
  onClose: () => void;
}) {
  const t = useConsoleText();
  const createMutation = useCreateReleaseMutation();
  const updateMutation = useUpdateReleaseMutation();
  const isEdit = target !== null && target !== "create";

  const [version, setVersion] = React.useState("");
  const [train, setTrain] = React.useState("");
  const [repository, setRepository] = React.useState("");
  const [releasedAt, setReleasedAt] = React.useState("");
  const [isSecurity, setIsSecurity] = React.useState(false);
  const [minUpgradeFrom, setMinUpgradeFrom] = React.useState("");
  const [changelogUrl, setChangelogUrl] = React.useState("");

  React.useEffect(() => {
    if (target === null) return;
    if (target === "create") {
      setVersion("");
      setTrain("");
      setRepository("");
      setReleasedAt(new Date().toISOString().slice(0, 10));
      setIsSecurity(false);
      setMinUpgradeFrom("");
      setChangelogUrl("");
      return;
    }
    setVersion(target.version);
    setTrain(target.train);
    setRepository(target.repository);
    setReleasedAt(target.released_at.slice(0, 10));
    setIsSecurity(target.is_security);
    setMinUpgradeFrom(target.min_upgrade_from ?? "");
    setChangelogUrl(target.changelog_url ?? "");
  }, [target]);

  const applyVersion = (value: string) => {
    setVersion(value);
    // трейн — первые два сегмента SemVer; правится вручную при необходимости
    const match = value.match(/^(\d+\.\d+)\.\d+$/);
    if (match) setTrain(match[1]);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (version === "" || train === "" || repository === "" || releasedAt === "")
      return;

    const input = {
      version,
      train,
      repository,
      released_at: releasedAt,
      is_security: isSecurity,
      min_upgrade_from: minUpgradeFrom === "" ? null : minUpgradeFrom,
      changelog_url: changelogUrl === "" ? null : changelogUrl,
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: target.id, input },
        { onSuccess: onClose },
      );
      return;
    }

    createMutation.mutate(input, { onSuccess: onClose });
  };

  return (
    <Dialog
      open={target !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent data-testid="release-form">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t("console.licensing.releases.form.edit-title")
              : t("console.licensing.releases.form.create-title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="mt-2 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("console.licensing.releases.form.version")}
              value={version}
              onChange={(e) => applyVersion(e.target.value)}
              placeholder="1.4.7"
              pattern="\d+\.\d+\.\d+"
              required
              data-testid="release-version"
            />
            <Input
              label={t("console.licensing.releases.form.train")}
              value={train}
              onChange={(e) => setTrain(e.target.value)}
              placeholder="1.4"
              pattern="\d+\.\d+"
              required
            />
          </div>
          <Input
            label={t("console.licensing.releases.form.repository")}
            value={repository}
            onChange={(e) => setRepository(e.target.value)}
            placeholder="crm/app-1.4"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label={t("console.licensing.releases.form.released-at")}
              value={releasedAt}
              onChange={(e) => setReleasedAt(e.target.value)}
              required
            />
            <Input
              label={t("console.licensing.releases.form.min-upgrade-from")}
              value={minUpgradeFrom}
              onChange={(e) => setMinUpgradeFrom(e.target.value)}
              placeholder="1.2.0"
              pattern="\d+\.\d+\.\d+"
            />
          </div>
          <Input
            type="url"
            label={t("console.licensing.releases.form.changelog-url")}
            value={changelogUrl}
            onChange={(e) => setChangelogUrl(e.target.value)}
            placeholder="https://…"
          />
          <div className="flex items-center gap-2">
            <Checkbox
              id="release-is-security"
              checked={isSecurity}
              onCheckedChange={(checked) => setIsSecurity(checked === true)}
            />
            <Label htmlFor="release-is-security" className="cursor-pointer">
              {t("console.licensing.releases.form.is-security")}
            </Label>
          </div>

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
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="release-submit"
            >
              {isEdit
                ? t("console.licensing.releases.form.edit-title")
                : t("console.licensing.releases.add")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
