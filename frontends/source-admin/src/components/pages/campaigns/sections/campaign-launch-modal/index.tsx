"use client";

import { FormProvider } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import { TemplateCard } from "./components/TemplateCard";
import { LaunchModalFooter } from "./components/LaunchModalFooter";
import { LaunchStepIndicator } from "./components/LaunchStepIndicator";
import { LaunchDetailsStep } from "./steps/LaunchDetailsStep";
import { LaunchReviewStep } from "./steps/LaunchReviewStep";
import { launchStepDescription } from "./types";
import { useCampaignLaunchModal } from "./useCampaignLaunchModal";

interface CampaignLaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function CampaignLaunchModal({ isOpen, onClose, onCreated }: CampaignLaunchModalProps) {
  const modal = useCampaignLaunchModal(isOpen, onClose, onCreated);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        size="lg"
        padding="none"
        radius="3xl"
        tone="card"
        scroll
        className="flex max-h-dialog-scroll flex-col"
      >
        <DialogHeader className="shrink-0 space-y-2 border-b border-border/50 p-6 text-left">
          <DialogTitle className="font-openrunde text-heading tracking-tight text-foreground">
            Launch campaign
          </DialogTitle>
          <DialogDescription className="text-caption text-muted-foreground">
            {launchStepDescription(modal.step)}
          </DialogDescription>
          <LaunchStepIndicator step={modal.step} />
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {modal.step === "template" && (
            <div className="flex flex-col gap-4">
              {modal.templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  selected={modal.templateId === template.id}
                  onSelect={() => modal.handleSelectTemplate(template.id)}
                />
              ))}
            </div>
          )}

          {modal.step === "schedule" && (
            <FormProvider {...modal.methods}>
              <LaunchDetailsStep selectedTemplate={modal.selectedTemplate} />
            </FormProvider>
          )}

          {modal.step === "review" && (
            <FormProvider {...modal.methods}>
              <LaunchReviewStep selectedTemplate={modal.selectedTemplate} />
            </FormProvider>
          )}
        </div>

        <LaunchModalFooter
          step={modal.step}
          templateSelected={Boolean(modal.templateId)}
          isSubmitting={modal.isSubmitting}
          onClose={onClose}
          onBack={modal.handleBack}
          onContinue={modal.handleContinue}
          onSchedule={() => modal.commit("schedule")}
          onLaunch={() => modal.commit("launch")}
        />
      </DialogContent>
    </Dialog>
  );
}
