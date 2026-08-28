"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import { Switch } from "@/components/ui/inputs/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import {
  useCopyPaymentProviderMutation,
  usePaymentProviderQuery,
  useProjectListQuery,
  useUpdatePaymentProviderMutation,
} from "@/hooks/admin/settings";
import { tf } from "@/lib/admin/console-texts";
import type { PlatformPaymentProvider } from "@/lib/admin/data-source/platform/pay";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { KeyValueJsonEditor } from "./KeyValueJsonEditor";

interface PaymentProviderModalProps {
  provider: string;
  providerName: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Настройки платёжного провайдера проекта: credentials/properties через
 * KeyValueJsonEditor, URL-ы возврата, статус active/archive и «Скопировать
 * с проекта» (Д9/Д10). Скопированные значения только подставляются в форму —
 * сохранение остаётся явным действием оператора.
 */
export function PaymentProviderModal({
  provider,
  providerName,
  isOpen,
  onClose,
}: PaymentProviderModalProps) {
  const t = useConsoleText();
  const settingsQuery = usePaymentProviderQuery(provider, isOpen);
  const update = useUpdatePaymentProviderMutation(provider);
  const copy = useCopyPaymentProviderMutation(provider);
  const projectsQuery = useProjectListQuery();

  const [credentials, setCredentials] = useState<Record<string, unknown>>({});
  const [properties, setProperties] = useState<Record<string, unknown>>({});
  const [returnUrl, setReturnUrl] = useState("");
  const [failUrl, setFailUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [credentialsValid, setCredentialsValid] = useState(true);
  const [propertiesValid, setPropertiesValid] = useState(true);
  const [sourceProject, setSourceProject] = useState("");

  const applySettings = (settings: PlatformPaymentProvider) => {
    setCredentials(settings.credentials);
    setProperties(settings.properties);
    setReturnUrl(settings.return_url ?? "");
    setFailUrl(settings.fail_url ?? "");
    setIsActive(settings.status === "active");
  };

  // Предзаполнение текущими настройками проекта при открытии
  useEffect(() => {
    if (!isOpen || !settingsQuery.data) return;
    applySettings(settingsQuery.data);
  }, [isOpen, settingsQuery.data]);

  const projectOptions = useMemo(
    () =>
      (projectsQuery.data?.projects ?? [])
        .filter((project) => project.key !== projectsQuery.data?.current)
        .map((project) => ({ value: project.key, label: project.name || project.key })),
    [projectsQuery.data],
  );

  const copyFromProject = () => {
    if (!sourceProject) return;
    copy.mutate(sourceProject, {
      onSuccess: (settings) => {
        applySettings(settings);
        toast.success(t("console.settings.payments.provider.copy-loaded"));
      },
      onError: (error: Error) =>
        toast.error(
          error.message || t("console.settings.payments.provider.copy-failed"),
        ),
    });
  };

  const isLoaded = settingsQuery.data !== undefined;
  const canSave =
    isLoaded && credentialsValid && propertiesValid && !update.isPending;

  const save = () => {
    update.mutate(
      {
        credentials,
        properties,
        return_url: returnUrl.trim() === "" ? null : returnUrl.trim(),
        fail_url: failUrl.trim() === "" ? null : failUrl.trim(),
        status: isActive ? "active" : "archived",
      },
      {
        onSuccess: () => {
          toast.success(t("console.settings.payments.provider.saved"));
          onClose();
        },
        onError: (error: Error) =>
          toast.error(
            error.message || t("console.settings.payments.provider.save-failed"),
          ),
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg" radius="3xl" scroll>
        <DialogHeader className="text-left">
          <DialogTitle className="text-heading tracking-tight">
            {tf("console.settings.payments.provider.title", { name: providerName })}
          </DialogTitle>
          <DialogDescription className="text-caption text-muted-foreground">
            {t("console.settings.payments.provider.description")}
          </DialogDescription>
        </DialogHeader>

        {settingsQuery.isError ? (
          <p className="text-caption text-destructive">
            {t("console.settings.payments.provider.load-failed")}
          </p>
        ) : null}

        <div className="flex flex-col gap-5">
          {projectOptions.length > 0 ? (
            <div className="flex items-end gap-2 rounded-2xl border border-border/60 bg-muted/15 p-3">
              <Select
                className="flex-1"
                placeholder={t(
                  "console.settings.payments.provider.copy-source-placeholder",
                )}
                aria-label={t(
                  "console.settings.payments.provider.copy-source-placeholder",
                )}
                options={projectOptions}
                value={sourceProject}
                onChange={(event) => setSourceProject(event.target.value)}
              />
              <Button
                type="button"
                variant="outlined"
                shape="circle"
                size="sm"
                startIcon={<Copy size={14} />}
                disabled={!sourceProject || copy.isPending}
                isLoading={copy.isPending}
                onClick={copyFromProject}
              >
                {t("console.settings.payments.provider.copy-from")}
              </Button>
            </div>
          ) : null}

          <KeyValueJsonEditor
            label={t("console.settings.payments.provider.credentials")}
            value={credentials}
            onChange={setCredentials}
            onValidityChange={setCredentialsValid}
            disabled={!isLoaded}
          />

          <KeyValueJsonEditor
            label={t("console.settings.payments.provider.properties")}
            value={properties}
            onChange={setProperties}
            onValidityChange={setPropertiesValid}
            disabled={!isLoaded}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("console.settings.payments.provider.return-url")}
              type="url"
              placeholder="https://"
              value={returnUrl}
              disabled={!isLoaded}
              onChange={(event) => setReturnUrl(event.target.value)}
            />
            <Input
              label={t("console.settings.payments.provider.fail-url")}
              type="url"
              placeholder="https://"
              value={failUrl}
              disabled={!isLoaded}
              onChange={(event) => setFailUrl(event.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/15 p-4">
            <div className="min-w-0">
              <p className="text-body font-medium text-foreground">
                {t("console.settings.payments.provider.status")}
              </p>
              <p className="mt-1 text-caption text-muted-foreground">
                {t("console.settings.payments.provider.status-hint")}
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={!isLoaded}
              aria-label={t("console.settings.payments.provider.status")}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outlined"
              shape="circle"
              size="sm"
              onClick={onClose}
            >
              {t("console.settings.payments.provider.cancel")}
            </Button>
            <Button
              type="button"
              variant="contained"
              shape="circle"
              size="sm"
              disabled={!canSave}
              isLoading={update.isPending}
              onClick={save}
            >
              {t("console.settings.payments.provider.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
