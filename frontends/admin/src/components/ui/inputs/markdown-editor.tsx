"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Редактор markdown поверх нативного `<textarea>`.
 *
 * Пакет `markdown-text-editor` не React-компонент: он навешивается на уже
 * существующий элемент и не подменяет его, поэтому значение живёт в самом
 * `textarea`. Обвязка ставится в эффекте и снимается при размонтировании —
 * иначе после ухода со страницы на элементе остались бы чужие обработчики.
 *
 * Пакет грузится динамически: он трогает `document` в конструкторе и на
 * серверном рендере упал бы.
 */
export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
  "data-testid"?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  label,
  placeholder,
  error,
  rows = 10,
  disabled = false,
  className,
  ...rest
}: MarkdownEditorProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  React.useEffect(() => {
    const element = ref.current;
    if (!element || disabled) return;

    let editor: { destroy(): void } | null = null;
    let cancelled = false;

    const notify = () => onChangeRef.current(element.value);

    void import("markdown-text-editor").then(({ default: MarkdownEditor }) => {
      if (cancelled) return;
      editor = new MarkdownEditor(element);
      // Редактор пишет в тот же textarea, поэтому правки видны как обычный input
      element.addEventListener("input", notify);
    });

    return () => {
      cancelled = true;
      element.removeEventListener("input", notify);
      editor?.destroy();
    };
  }, [disabled]);

  // Значение приходит извне (сброс формы, применение пресета) — синхронизируем
  React.useEffect(() => {
    const element = ref.current;
    if (element && element.value !== value) element.value = value;
  }, [value]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}

      <textarea
        ref={ref}
        defaultValue={value}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-(--radius-2xl) border-2 border-border/70 bg-background/80 px-4 py-2 font-mono text-caption text-foreground shadow-inner outline-none transition-all focus-visible:border-primary disabled:opacity-50"
        {...rest}
      />

      {error && <span className="ui-form-help-text font-medium text-destructive">{error}</span>}
    </div>
  );
}
