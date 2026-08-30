"use client";

import * as React from "react";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import { useSaveSeoMutation } from "@/hooks/admin/seo";
import type { ConsoleTextKey } from "@/lib/admin/console-texts";
import { formatJsonObject, parseJsonObject } from "@/lib/admin/key-value-json";
import type { PlatformSeoCatalogItem } from "@/lib/admin/services/content-domain/seo-catalog";
import { useConsoleText } from "@/lib/admin/use-console-text";

type TextField =
  | "title"
  | "description"
  | "keywords"
  | "canonical"
  | "robots"
  | "og_title"
  | "og_description"
  | "og_image"
  | "twitter_card";

const TEXT_FIELDS: TextField[] = [
  "title",
  "description",
  "keywords",
  "canonical",
  "robots",
  "og_title",
  "og_description",
  "og_image",
  "twitter_card",
];

const LABELS: Record<TextField, ConsoleTextKey> = {
  title: "console.seo.table.title",
  description: "console.seo.table.description",
  keywords: "console.seo.table.keywords",
  canonical: "console.seo.table.canonical",
  robots: "console.seo.table.robots",
  og_title: "console.seo.table.og-title",
  og_description: "console.seo.table.og-description",
  og_image: "console.seo.table.og-image",
  twitter_card: "console.seo.table.twitter-card",
};

/** Правка SEO-записи: все поля платформы, включая JSON-LD. */
export function SeoRecordDialog({
  target,
  onClose,
}: {
  target: PlatformSeoCatalogItem | null;
  onClose: () => void;
}) {
  const t = useConsoleText();
  const save = useSaveSeoMutation();

  const [fields, setFields] = React.useState<Record<TextField, string>>(
    emptyFields(),
  );
  const [jsonLd, setJsonLd] = React.useState("");
  const [jsonError, setJsonError] = React.useState(false);

  React.useEffect(() => {
    if (target === null) return;

    setFields(
      Object.fromEntries(
        TEXT_FIELDS.map((field) => [field, target.seo[field] ?? ""]),
      ) as Record<TextField, string>,
    );
    setJsonLd(target.seo.json_ld ? formatJsonObject(target.seo.json_ld) : "");
    setJsonError(false);
  }, [target]);

  if (target === null) return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedJson = jsonLd.trim();
    const parsed = trimmedJson === "" ? null : parseJsonObject(trimmedJson);

    if (parsed !== null && !parsed.ok) {
      setJsonError(true);
      return;
    }

    setJsonError(false);
    save.mutate(
      {
        type: target.type,
        id: target.entity_id,
        meta: {
          ...Object.fromEntries(
            TEXT_FIELDS.map((field) => [
              field,
              fields[field].trim() === "" ? null : fields[field],
            ]),
          ),
          json_ld: parsed === null ? null : parsed.value,
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{target.entity_title}</DialogTitle>
          <DialogDescription>{t("console.seo.form.hint")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="mt-2 flex flex-col gap-4">
          {TEXT_FIELDS.map((field) => (
            <Input
              key={field}
              label={t(LABELS[field])}
              value={fields[field]}
              onChange={(e) =>
                setFields({ ...fields, [field]: e.target.value })
              }
              data-testid={`seo-field-${field}`}
            />
          ))}

          <Textarea
            label={t("console.seo.table.json-ld")}
            value={jsonLd}
            rows={6}
            onChange={(e) => setJsonLd(e.target.value)}
            error={jsonError ? t("console.seo.form.json-invalid") : undefined}
            data-testid="seo-field-json-ld"
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outlined" shape="circle" onClick={onClose}>
              {t("console.common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              shape="circle"
              disabled={save.isPending}
              data-testid="seo-save"
            >
              {t("console.common.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function emptyFields(): Record<TextField, string> {
  return Object.fromEntries(TEXT_FIELDS.map((field) => [field, ""])) as Record<
    TextField,
    string
  >;
}
