"use client";

import { ArrowLeft, ArrowRight, CalendarClock, Send } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { Tooltip } from "@/components/ui/overlay/tooltip";
import type { EngageModalStep } from "../types";

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
  if (step === "audience") {
    return (
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-border/50 p-6">
        <Button type="button" variant="outlined" shape="circle" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="contained"
          shape="circle"
          endIcon={<ArrowRight />}
          disabled={!canContinue}
          onClick={onContinue}
        >
          Continue
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
          Back
        </Button>
        <Button
          type="button"
          variant="contained"
          shape="circle"
          endIcon={<ArrowRight />}
          disabled={!canContinue}
          onClick={onContinue}
        >
          {step === "intent" ? "Configure" : "Review"}
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
        Back
      </Button>
      <div className="flex flex-wrap items-center gap-2">
        <Tooltip
          title="Queue this outreach for the schedule date without sending immediately."
          side="top"
        >
          <Button
            type="button"
            variant="outlined"
            shape="circle"
            startIcon={<CalendarClock />}
            disabled={isSubmitting}
            onClick={onSchedule}
          >
            Schedule
          </Button>
        </Tooltip>
        <Tooltip
          title={`Send this outreach to ${audienceCount} customer${audienceCount === 1 ? "" : "s"} now.`}
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
            {isSubmitting ? "Sending…" : `Send to ${audienceCount}`}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
