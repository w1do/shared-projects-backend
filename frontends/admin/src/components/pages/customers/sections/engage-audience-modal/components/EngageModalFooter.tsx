"use client";

import { ArrowLeft, ArrowRight, CalendarClock, Send } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { Tooltip } from "@/components/ui/overlay/tooltip";
import type { EngageModalStep } from "../types";
import { useConsoleText } from "@/lib/admin/use-console-text";

type EngageModalFooterProps = {
  step: EngageModalStep;
  canContinue: boolean;
  isSubmitting: boolean;
  audienceCount: number;
  onClose: () => void;
  onBack: () => void;
  onContinue: () => void;
  onSchedule: () => void;
  onSend: () => void;
};

export function EngageModalFooter({
  step,
  canContinue,
  isSubmitting,
  audienceCount,
  onClose,
  onBack,
  onContinue,
  onSchedule,
  onSend,
}: EngageModalFooterProps) {
  const t = useConsoleText();

  if (step === "audience") {
    return (
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-border/50 p-6">
        <Button type="button" variant="outlined" shape="circle" onClick={onClose}>
          {t("console.common.cancel")}
        </Button>
        <Button
          type="button"
          variant="contained"
          shape="circle"
          endIcon={<ArrowRight />}
          disabled={!canContinue}
          onClick={onContinue}
        >
          {t("console.engage.footer.continue")}
        </Button>
      </div>
    );
  }

  if (step === "intent" || step === "configure") {
    return (
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-border/50 p-6">
        <Button
          type="button"
          variant="outlined"
          shape="circle"
          startIcon={<ArrowLeft />}
          onClick={onBack}
        >
          {t("console.engage.footer.back")}
        </Button>
        <Button
          type="button"
          variant="contained"
          shape="circle"
          endIcon={<ArrowRight />}
          disabled={!canContinue}
          onClick={onContinue}
        >
          {step === "intent"
            ? t("console.engage.footer.configure")
            : t("console.engage.footer.review")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-border/50 p-6">
      <Button
        type="button"
        variant="outlined"
        shape="circle"
        startIcon={<ArrowLeft />}
        disabled={isSubmitting}
        onClick={onBack}
      >
        {t("console.engage.footer.back")}
      </Button>
      <div className="flex flex-wrap items-center gap-2">
        <Tooltip title={t("console.engage.footer.schedule-hint")} side="top">
          <Button
            type="button"
            variant="outlined"
            shape="circle"
            startIcon={<CalendarClock />}
            disabled={isSubmitting}
            onClick={onSchedule}
          >
            {t("console.engage.footer.schedule")}
          </Button>
        </Tooltip>
        <Tooltip
          title={t("console.engage.footer.send-hint").replace("{count}", String(audienceCount))}
          side="top"
        >
          <Button
            type="button"
            variant="contained"
            color="secondary"
            shape="circle"
            startIcon={<Send />}
            disabled={isSubmitting}
            onClick={onSend}
          >
            {isSubmitting
              ? t("console.engage.footer.sending")
              : t("console.engage.footer.send").replace("{count}", String(audienceCount))}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
