"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/data-display/card";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import { Switch } from "@/components/ui/inputs/switch";
import { Textarea } from "@/components/ui/inputs/textarea";
import { useConsoleText } from "@/lib/admin/use-console-text";
import type { PlatformInstruct } from "@/lib/admin/services";
import {
  useInstructCategoriesQuery,
  useSaveInstructMutation,
  useSchemaPresetsQuery,
} from "@/hooks/admin/instructs";
import { SchemaEditor } from "@/components/pages/instructs/sections/schema-editor";
import { SystemInstructNotice } from "./SystemInstructNotice";
import { PresetReplaceDialog } from "./PresetReplaceDialog";
import { useInstructForm } from "./useInstructForm";

type Props = {
  instruct: PlatformInstruct | null;
  canManage: boolean;
  onClose: () => void;
};

/**
 * Создание и правка инструкции. Предустановленная открывается только на
 * чтение: её можно взять за основу своей, но не изменить.
 */
export function InstructFormSection({ instruct, canManage, onClose }: Props) {
  const t = useConsoleText();
  const { data: categories = [] } = useInstructCategoriesQuery();
  const { data: presets = [] } = useSchemaPresetsQuery();
  const save = useSaveInstructMutation();

  const form = useInstructForm(instruct, presets);
  const readOnly = instruct?.is_system === true || !canManage;
  const [basedOnSystem, setBasedOnSystem] = React.useState(false);
  const editable = !readOnly || basedOnSystem;

  const { setCategory } = form;
  React.useEffect(() => {
    if (categories.length > 0 && form.category === "") setCategory(categories[0].value);
  }, [categories, form.category, setCategory]);

  const submit = () => {
    const schema = form.schemaForSubmit();
    if (schema === null) return;

    save.mutate(
      {
        // Своя инструкция на основе предустановленной создаётся как новая
        id: basedOnSystem ? undefined : instruct?.id,
        body: {
          title: form.title,
          category: form.category,
          rule: form.rule,
          schema,
          published: form.published,
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="flex flex-col gap-6" data-testid="instruct-form">
      <Button
        variant="ghost"
        shape="circle"
        size="sm"
        startIcon={<ArrowLeft />}
        className="w-fit"
        onClick={onClose}
        data-testid="instruct-back"
      >
        {t("console.instructs.cancel")}
      </Button>

      {readOnly && !basedOnSystem && (
        <SystemInstructNotice canManage={canManage} onDuplicate={() => setBasedOnSystem(true)} />
      )}

      <Card variant="form-section">
        <div className="flex flex-col gap-2">
          <h2 className="text-heading font-medium leading-tight text-foreground">
            {t("console.instructs.form.details")}
          </h2>
          <p className="text-xs text-muted-foreground-lighter">
            {t("console.instructs.form.details-hint")}
          </p>
        </div>

        <Input
          label={t("console.instructs.name")}
          value={form.title}
          disabled={!editable}
          onChange={(event) => form.setTitle(event.target.value)}
          data-testid="instruct-title-input"
        />

        <Select
          label={t("console.instructs.category")}
          value={form.category}
          options={categories.map((item) => ({ value: item.value, label: item.label }))}
          disabled={!editable}
          onChange={(event) => form.setCategory(event.target.value)}
          data-testid="instruct-category-select"
        />

        <Textarea
          label={t("console.instructs.rule")}
          value={form.rule}
          rows={6}
          disabled={!editable}
          onChange={(event) => form.setRule(event.target.value)}
          data-testid="instruct-rule-input"
        />

        {editable && (
          <label className="flex items-center gap-4 text-xs text-muted-foreground">
            <Switch
              checked={form.published}
              onCheckedChange={form.setPublished}
              data-testid="instruct-published-input"
            />
            {t("console.instructs.published")}
          </label>
        )}
      </Card>

      <Card variant="form-section">
        <SchemaEditor
          mode={form.mode}
          onModeChange={form.setMode}
          fields={form.fields}
          onFieldsChange={form.setFields}
          json={form.json}
          onJsonChange={form.setJson}
          fieldsDisabled={form.fieldsDisabled}
          disabled={!editable}
          error={form.schemaError}
          presetOptions={editable ? form.presetOptions : []}
          presetValue={form.suggestedPreset}
          onPresetChange={form.requestPreset}
        />
      </Card>

      {editable && (
        <div className="flex flex-wrap gap-2">
          <Button
            shape="circle"
            isLoading={save.isPending}
            onClick={submit}
            data-testid="instruct-save"
          >
            {t("console.instructs.save")}
          </Button>
          <Button variant="ghost" shape="circle" onClick={onClose}>
            {t("console.instructs.cancel")}
          </Button>
        </div>
      )}

      <PresetReplaceDialog
        preset={form.pendingPreset}
        onClose={form.cancelPreset}
        onConfirm={form.confirmPreset}
      />
    </div>
  );
}
