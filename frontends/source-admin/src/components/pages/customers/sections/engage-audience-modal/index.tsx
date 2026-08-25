"use client";

import { FormProvider } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import type { DetailedCustomer } from "@/lib/admin/mocks/customers";
import { EngageModalFooter } from "./components/EngageModalFooter";
import { EngageStepIndicator } from "./components/EngageStepIndicator";
import { AudienceStep } from "./steps/AudienceStep";
import { ConfigureStep } from "./steps/ConfigureStep";
import { IntentStep } from "./steps/IntentStep";
import { ReviewStep } from "./steps/ReviewStep";
import { engageStepDescription } from "./types";
import { useEngageAudienceModal } from "./useEngageAudienceModal";

interface EngageAudienceModalProps {
  isOpen: boolean;
  customers: DetailedCustomer[];
  onClose: () => void;
  onSent?: () => void;
}

export function EngageAudienceModal({
  isOpen,
  customers,
  onClose,
  onSent,
}: EngageAudienceModalProps) {
  const modal = useEngageAudienceModal(isOpen, customers, onClose, onSent);

  const canContinue =
    modal.step === "audience"
      ? modal.audienceCustomers.length > 0
      : modal.step === "intent"
        ? Boolean(modal.intent)
        : true;

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
            Engage audience
          </DialogTitle>
          <DialogDescription className="text-caption text-muted-foreground">
            {engageStepDescription(modal.step)}
          </DialogDescription>
          <EngageStepIndicator step={modal.step} />
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {modal.step === "audience" ? (
            <AudienceStep
              customers={modal.audienceCustomers}
              onRemove={modal.handleRemoveAudience}
            />
          ) : null}

          {modal.step === "intent" ? (
            <IntentStep intent={modal.intent} onSelect={modal.handleSelectIntent} />
          ) : null}

          {modal.step === "configure" ? (
            <FormProvider {...modal.methods}>
              <ConfigureStep
                campaigns={modal.campaigns}
                promotions={modal.promotions}
                coupons={modal.coupons}
              />
            </FormProvider>
          ) : null}

          {modal.step === "review" ? (
            <FormProvider {...modal.methods}>
              <ReviewStep
                customers={modal.audienceCustomers}
                campaigns={modal.campaigns}
                promotions={[...modal.promotions, ...modal.coupons]}
              />
            </FormProvider>
          ) : null}
        </div>

        <EngageModalFooter
          step={modal.step}
          canContinue={canContinue}
          isSubmitting={modal.isSubmitting}
          audienceCount={modal.audienceCustomers.length}
          onClose={onClose}
          onBack={modal.handleBack}
          onContinue={modal.handleContinue}
          onSchedule={() => modal.commit("schedule")}
          onSend={() => modal.commit("send")}
        />
      </DialogContent>
    </Dialog>
  );
}
