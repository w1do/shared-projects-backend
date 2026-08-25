export type LaunchModalStep = "template" | "schedule" | "review";

export const launchModalSteps: Array<{ id: LaunchModalStep; label: string; index: number }> = [
  { id: "template", label: "Template", index: 1 },
  { id: "schedule", label: "Schedule", index: 2 },
  { id: "review", label: "Review", index: 3 },
];

export function launchStepDescription(step: LaunchModalStep): string {
  if (step === "template") {
    return "Pick a campaign from your store. Assets stay locked — you only set the schedule next.";
  }
  if (step === "schedule") {
    return "Set the launch window. Everything else stays copied from the selected template.";
  }
  return "Review your template and schedule, then schedule or launch now.";
}
