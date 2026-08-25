"use client";

import type { EngageIntent } from "@/lib/admin/schemas/content/engage-audience-schema";
import { IntentCard } from "../components/IntentCard";
import { intentOptions } from "../types";

type IntentStepProps = {
  intent: EngageIntent;
  onSelect: (intent: EngageIntent) => void;
};

export function IntentStep({ intent, onSelect }: IntentStepProps) {
  return (
    <div className="flex flex-col gap-4">
      {intentOptions.map((option) => (
        <IntentCard
          key={option.id}
          option={option}
          selected={intent === option.id}
          onSelect={() => onSelect(option.id)}
        />
      ))}
    </div>
  );
}
