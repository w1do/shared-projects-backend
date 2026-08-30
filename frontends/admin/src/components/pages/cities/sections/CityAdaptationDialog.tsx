"use client";

import * as React from "react";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import { useProjectCardQuery } from "@/hooks/admin/project";
import { tf } from "@/lib/admin/console-texts";
import { useConsoleText } from "@/lib/admin/use-console-text";

type Adaptation = {
  start: (topic: string, options?: { onSuccess?: () => void }) => void;
  isStarting: boolean;
};

/** Запуск AI-адаптации: тематика проекта с правкой и число затрагиваемых городов. */
export function CityAdaptationDialog({
  affected,
  adaptation,
  onClose,
}: {
  affected: number;
  adaptation: Adaptation;
  onClose: () => void;
}) {
  const t = useConsoleText();
  const project = useProjectCardQuery();
  const [topic, setTopic] = React.useState("");
  const [touched, setTouched] = React.useState(false);

  const projectTopic = project.data?.topic ?? "";

  React.useEffect(() => {
    if (!touched) setTopic(projectTopic);
  }, [projectTopic, touched]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    if (topic.trim() === "") {
      setTouched(true);
      return;
    }

    adaptation.start(topic.trim(), { onSuccess: onClose });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("console.cities.adapt.title")}</DialogTitle>
          <DialogDescription>
            {t("console.cities.adapt.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="mt-2 flex flex-col gap-4">
          <Input
            label={t("console.cities.adapt.topic")}
            value={topic}
            onChange={(e) => {
              setTouched(true);
              setTopic(e.target.value);
            }}
            error={
              touched && topic.trim() === ""
                ? t("console.cities.adapt.topic-required")
                : undefined
            }
            data-testid="cities-adapt-topic"
          />

          <p className="text-caption text-muted-foreground">
            {tf("console.cities.adapt.affected", { count: affected })}
          </p>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outlined"
              shape="circle"
              onClick={onClose}
            >
              {t("console.common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              shape="circle"
              disabled={adaptation.isStarting}
              data-testid="cities-adapt-submit"
            >
              {t("console.cities.adapt.submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
