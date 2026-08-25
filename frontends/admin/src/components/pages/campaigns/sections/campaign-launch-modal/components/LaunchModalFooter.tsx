"use client";

import { ArrowLeft, ArrowRight, CalendarClock, Rocket } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { Tooltip } from "@/components/ui/overlay/tooltip";
import type { LaunchModalStep } from "../types";

type LaunchModalFooterProps = {
  step: LaunchModalStep;
  templateSelected: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onBack: () => void;
  onContinue: () => void;
  onSchedule: () => void;
  onLaunch: () => void;
};

export function LaunchModalFooter({
  step,
  templateSelected,
  isSubmitting,
  onClose,
  onBack,
  onContinue,
  onSchedule,
  onLaunch,
}: LaunchModalFooterProps) {
  if (step === "template") {
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
          disabled={!templateSelected}
          onClick={onContinue}
        >
          Continue
        </Button>
      </div>
    );
  }

  if (step === "schedule") {
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
          onClick={onContinue}
        >
          Review launch
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
          title="Save as Scheduled and keep the start date from step 2. The campaign will not go live until that date."
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
          title="Go live immediately. Status becomes Active and the start date is set to today."
          side="top"
        >
          <Button
            type="button"
            variant="contained"
            color="secondary"
            shape="circle"
            startIcon={<Rocket />}
            disabled={isSubmitting}
            onClick={onLaunch}
          >
            {isSubmitting ? "Launching…" : "Launch now"}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
