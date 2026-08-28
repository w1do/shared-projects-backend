"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import {
  formatJsonObject,
  objectToPairs,
  pairsToObject,
  parseJsonObject,
} from "@/lib/admin/key-value-json";
import { useConsoleText } from "@/lib/admin/use-console-text";

type EditorMode = "pairs" | "json";

type Row = { id: number; key: string; value: string };

interface KeyValueJsonEditorProps {
  label: string;
  /** Источник истины — JS-объект; режимы «пары» и «JSON» — два его представления. */
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  /** Невалидный JSON блокирует сохранение формы. */
  onValidityChange?: (valid: boolean) => void;
  disabled?: boolean;
}

/** Редактор JSON-поля: строки «ключ → значение» или сырой JSON с валидацией. */
export function KeyValueJsonEditor({
  label,
  value,
  onChange,
  onValidityChange,
  disabled,
}: KeyValueJsonEditorProps) {
  const t = useConsoleText();
  const [mode, setMode] = useState<EditorMode>("pairs");
  const idRef = useRef(0);
  const lastEmitted = useRef(value);

  const toRows = (source: Record<string, unknown>): Row[] =>
    objectToPairs(source).map((pair) => ({ id: ++idRef.current, ...pair }));

  const [rows, setRows] = useState<Row[]>(() => toRows(value));
  const [jsonText, setJsonText] = useState(() => formatJsonObject(value));
  const [jsonError, setJsonError] = useState<
    "invalid-json" | "not-an-object" | null
  >(null);

  // Внешняя подстановка значения (загрузка формы, «Скопировать с проекта»)
  // ресинкает оба представления и снимает ошибку JSON.
  useEffect(() => {
    if (value === lastEmitted.current) return;
    lastEmitted.current = value;
    setRows(toRows(value));
    setJsonText(formatJsonObject(value));
    setJsonError(null);
    onValidityChange?.(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const emit = (next: Record<string, unknown>) => {
    lastEmitted.current = next;
    onChange(next);
  };

  const updateRows = (next: Row[]) => {
    setRows(next);
    emit(pairsToObject(next));
  };

  const switchMode = (next: EditorMode) => {
    if (next === mode) return;

    if (next === "json") {
      setJsonText(formatJsonObject(pairsToObject(rows)));
      setJsonError(null);
      onValidityChange?.(true);
    } else {
      // Введённое в JSON видно в парах только когда JSON валиден
      const parsed = parseJsonObject(jsonText);
      if (!parsed.ok) return;
      setRows(toRows(parsed.value));
    }

    setMode(next);
  };

  const onJsonChange = (text: string) => {
    setJsonText(text);
    const parsed = parseJsonObject(text);

    if (parsed.ok) {
      setJsonError(null);
      emit(parsed.value);
      onValidityChange?.(true);
      return;
    }

    setJsonError(parsed.error);
    onValidityChange?.(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-caption font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={mode === "pairs" ? "soft" : "text"}
            size="xs"
            shape="circle"
            disabled={disabled || (mode === "json" && jsonError !== null)}
            onClick={() => switchMode("pairs")}
          >
            {t("console.settings.payments.provider.mode-pairs")}
          </Button>
          <Button
            type="button"
            variant={mode === "json" ? "soft" : "text"}
            size="xs"
            shape="circle"
            disabled={disabled}
            onClick={() => switchMode("json")}
          >
            {t("console.settings.payments.provider.mode-json")}
          </Button>
        </div>
      </div>

      {mode === "pairs" ? (
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-2">
              <Input
                mono
                className="flex-1"
                placeholder={t("console.settings.payments.provider.key-placeholder")}
                aria-label={t("console.settings.payments.provider.key-placeholder")}
                value={row.key}
                disabled={disabled}
                onChange={(event) =>
                  updateRows(
                    rows.map((item) =>
                      item.id === row.id ? { ...item, key: event.target.value } : item,
                    ),
                  )
                }
              />
              <Input
                mono
                className="flex-1"
                placeholder={t("console.settings.payments.provider.value-placeholder")}
                aria-label={t("console.settings.payments.provider.value-placeholder")}
                value={row.value}
                disabled={disabled}
                onChange={(event) =>
                  updateRows(
                    rows.map((item) =>
                      item.id === row.id ? { ...item, value: event.target.value } : item,
                    ),
                  )
                }
              />
              <IconButton
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                aria-label={`${label}: ${t("console.settings.payments.provider.key-placeholder")} ${row.key}`}
                onClick={() => updateRows(rows.filter((item) => item.id !== row.id))}
              >
                <X size={14} />
              </IconButton>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            shape="circle"
            className="self-start"
            startIcon={<Plus size={14} />}
            disabled={disabled}
            onClick={() =>
              setRows([...rows, { id: ++idRef.current, key: "", value: "" }])
            }
          >
            {t("console.settings.payments.provider.add-pair")}
          </Button>
        </div>
      ) : (
        <Textarea
          rows={6}
          className="font-mono"
          value={jsonText}
          disabled={disabled}
          aria-label={label}
          error={
            jsonError === null
              ? undefined
              : t(
                  jsonError === "invalid-json"
                    ? "console.settings.payments.provider.invalid-json"
                    : "console.settings.payments.provider.json-not-object",
                )
          }
          onChange={(event) => onJsonChange(event.target.value)}
        />
      )}
    </div>
  );
}
