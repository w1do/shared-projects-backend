"use client";

import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import { Switch } from "@/components/ui/inputs/switch";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { useConsoleText } from "@/lib/admin/use-console-text";
import type { SchemaField, SchemaFieldType } from "@/lib/admin/instructs/schema-fields";

const TYPES: SchemaFieldType[] = ["string", "number", "boolean", "object", "array"];

type Props = {
  field: SchemaField;
  disabled?: boolean;
  onChange: (field: SchemaField) => void;
  onRemove: () => void;
};

/** Одно поле схемы: имя, тип, обязательность и краткое назначение. */
export function SchemaFieldRow({ field, disabled = false, onChange, onRemove }: Props) {
  const t = useConsoleText();

  const typeOptions = TYPES.map((type) => ({
    value: type,
    label: t(`console.instructs.schema.type-${type}`),
  }));

  return (
    <div
      className="flex flex-col gap-4 rounded-2xl border border-border/60 p-4"
      data-testid={`schema-field-${field.name}`}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={t("console.instructs.schema.field-name")}
          value={field.name}
          disabled={disabled}
          onChange={(event) => onChange({ ...field, name: event.target.value })}
          data-testid="schema-field-name"
        />
        <Select
          label={t("console.instructs.schema.field-type")}
          value={field.type}
          options={typeOptions}
          disabled={disabled}
          onChange={(event) =>
            onChange({ ...field, type: event.target.value as SchemaFieldType })
          }
          data-testid="schema-field-type"
        />
      </div>

      <Input
        label={t("console.instructs.schema.field-description")}
        value={field.description ?? ""}
        disabled={disabled}
        onChange={(event) => onChange({ ...field, description: event.target.value })}
        data-testid="schema-field-description"
      />

      <div className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Switch
            checked={field.required}
            disabled={disabled}
            onCheckedChange={(checked) => onChange({ ...field, required: checked })}
            data-testid="schema-field-required"
          />
          {t("console.instructs.schema.field-required")}
        </label>

        {!disabled && (
          <IconButton
            type="button"
            variant="ghost"
            color="error"
            shape="circle"
            size="sm"
            aria-label={t("console.instructs.schema.remove-field")}
            onClick={onRemove}
            data-testid="schema-field-remove"
          >
            <Trash2 />
          </IconButton>
        )}
      </div>
    </div>
  );
}
