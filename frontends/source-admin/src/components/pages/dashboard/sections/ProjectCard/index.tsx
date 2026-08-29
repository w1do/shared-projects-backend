"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Badge } from "@/components/ui/data-display/badge";
import { t } from "@/lib/admin/console-texts";
import {
  useConsoleAccessQuery,
  useProjectCardQuery,
  useSaveProjectCardMutation,
} from "@/hooks/admin/project";

import { BuildoutPanel } from "./BuildoutPanel";

/**
 * Карточка текущего проекта: идентификатор, название, описание и запуск
 * сборки проекта по AI. Данные приходят из платформы, демо-значений нет.
 */
export function ProjectCard() {
  const { data: project } = useProjectCardQuery();
  const { data: access } = useConsoleAccessQuery();
  const save = useSaveProjectCardMutation();

  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const canManage = access?.canManageProject ?? false;

  React.useEffect(() => {
    if (!project || editing) return;
    setName(project.name);
    setDescription(project.description ?? "");
  }, [project, editing]);

  if (!project) return null;

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(project.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const submit = () => {
    save.mutate(
      { name, description: description.trim() === "" ? null : description },
      { onSuccess: () => setEditing(false) },
    );
  };

  return (
    <div
      className="rounded-3xl bg-card p-6 shadow-subtle-3"
      data-testid="project-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-openrunde text-heading leading-tight text-foreground">
            {t("console.project.title")}
          </h3>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {t("console.project.id")}
            </span>
            <code
              className="rounded-md bg-muted px-2 py-1 text-xs text-foreground"
              data-testid="project-card-id"
            >
              {project.id}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyId}
              aria-label={t("console.project.copy-id")}
              data-testid="project-card-copy"
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {canManage && !editing && (
          <Button
            variant="outlined"
            onClick={() => setEditing(true)}
            data-testid="project-card-edit"
          >
            {t("console.project.edit")}
          </Button>
        )}
      </div>

      {editing ? (
        <div
          className="mt-6 flex flex-col gap-4"
          data-testid="project-card-form"
        >
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("console.project.name")}
            data-testid="project-card-name-input"
          />
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t("console.project.description")}
            rows={4}
            data-testid="project-card-description-input"
          />
          <div className="flex gap-2">
            <Button
              onClick={submit}
              disabled={save.isPending}
              data-testid="project-card-save"
            >
              {t("console.project.save")}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              {t("console.project.cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          <p
            className="text-body text-foreground"
            data-testid="project-card-name"
          >
            {project.name}
          </p>

          {project.description ? (
            <p
              className="text-caption text-muted-foreground"
              data-testid="project-card-description"
            >
              {project.description}
            </p>
          ) : (
            <p
              className="text-caption text-muted-foreground-lighter"
              data-testid="project-card-description-empty"
            >
              {t("console.project.description-empty")}
            </p>
          )}

          {project.topic && (
            <Badge
              variant="secondary"
              className="w-fit"
              data-testid="project-card-topic"
            >
              {project.topic}
            </Badge>
          )}
        </div>
      )}

      {canManage && <BuildoutPanel initialTopic={project.topic ?? ""} />}
    </div>
  );
}
