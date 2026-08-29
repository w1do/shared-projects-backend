"use client";

import * as React from "react";
import { Check, History, Plus } from "lucide-react";
import { Badge } from "@/components/ui/data-display/badge";
import { Button } from "@/components/ui/inputs/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import { cn } from "@/lib/utils";
import { useConsoleText } from "@/lib/admin/use-console-text";
import type { ProjectEvent } from "@/lib/admin/services";
import {
  useConsoleAccessQuery,
  useOperatorProjectsQuery,
  useSwitchProjectMutation,
} from "@/hooks/admin/project";
import { CreateProjectDialog } from "./CreateProjectDialog";

type Props = {
  open: boolean;
  events: ProjectEvent[];
  onClose: () => void;
  onSwitched: () => void;
};

/** Дата события в коротком виде; без времени — прочерк. */
function eventTime(value: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleString();
}

/**
 * Окно текущего проекта: где я, что здесь происходило и куда перейти.
 * Создание проекта живёт здесь же — отдельной кнопки в панели нет.
 */
export function ProjectDialog({ open, events, onClose, onSwitched }: Props) {
  const t = useConsoleText();
  const { data: access } = useConsoleAccessQuery();
  const { data: projects = [] } = useOperatorProjectsQuery();
  const switchProject = useSwitchProjectMutation();
  const [error, setError] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    if (!open) setError(null);
  }, [open]);

  const others = projects.filter((project) => !project.current);

  const select = (key: string) => {
    setError(null);
    switchProject.mutate(key, {
      onSuccess: onSwitched,
      onError: (reason: Error) =>
        setError(reason.message || t("console.project.switch.failed")),
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => !next && !switchProject.isPending && onClose()}>
        <DialogContent size="md" radius="3xl" scroll data-testid="project-dialog">
          <DialogTitle className="text-heading-lg font-semibold">
            {t("console.project.dialog.title")}
          </DialogTitle>
          <DialogDescription className="mt-2 text-xs text-muted-foreground">
            {t("console.project.dialog.subtitle")}
          </DialogDescription>

          <div className="mt-6 flex flex-col gap-2" data-testid="project-list">
            {projects.map((project) => (
              <Button
                key={project.key}
                variant={project.current ? "soft" : "ghost"}
                colors="surface"
                size="auto"
                shape="rectangle"
                disabled={switchProject.isPending}
                onClick={() => !project.current && select(project.key)}
                className={cn(
                  "w-full justify-between rounded-2xl px-4 py-2 text-left",
                  project.current && "cursor-default",
                )}
                data-testid={`project-option-${project.key}`}
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-body text-foreground">{project.name}</span>
                  <span className="truncate text-caption text-muted-foreground-lighter">
                    {project.key}
                  </span>
                </span>
                {project.current && (
                  <Badge variant="soft" color="success" shape="circle" startIcon={<Check />}>
                    {t("console.project.dialog.current")}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {others.length === 0 && (
            <p
              className="mt-4 text-xs text-muted-foreground-lighter"
              data-testid="project-only-one"
            >
              {t("console.project.dialog.only-one")}
            </p>
          )}

          {error && (
            <p className="mt-4 text-xs font-medium text-destructive" data-testid="project-switch-error">
              {error}
            </p>
          )}

          <div className="mt-6 border-t border-border/40 pt-4">
            <div className="flex items-center gap-2">
              <History className="size-4 text-muted-foreground-lighter" />
              <h3 className="text-xs font-medium text-muted-foreground">
                {t("console.project.dialog.events")}
              </h3>
            </div>

            {events.length === 0 ? (
              <p
                className="mt-4 text-xs text-muted-foreground-lighter"
                data-testid="project-events-empty"
              >
                {t("console.project.dialog.events-empty")}
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-2" data-testid="project-events">
                {events.map((event) => (
                  <li key={event.id} className="flex items-center justify-between gap-4">
                    <span className="min-w-0 truncate text-caption text-foreground">
                      {event.action}
                      {event.subject ? ` · ${event.subject}` : ""}
                    </span>
                    <span className="shrink-0 text-caption text-muted-foreground-lighter">
                      {eventTime(event.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 flex flex-wrap justify-between gap-2">
            {access?.isSuperAdmin ? (
              <Button
                variant="outlined"
                shape="circle"
                size="sm"
                startIcon={<Plus />}
                onClick={() => setCreating(true)}
                data-testid="project-create"
              >
                {t("console.project.create.action")}
              </Button>
            ) : (
              <span />
            )}
            <Button
              variant="ghost"
              shape="circle"
              size="sm"
              disabled={switchProject.isPending}
              onClick={onClose}
            >
              {t("console.common.close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CreateProjectDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={() => {
          setCreating(false);
          onSwitched();
        }}
      />
    </>
  );
}
