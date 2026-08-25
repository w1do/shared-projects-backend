"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  campaignFormSchema,
  defaultCampaignFormValues,
  type CampaignFormValues,
} from "@/lib/admin/schemas/content/campaign-form-schema";
import {
  getCampaignLaunchTemplates,
  getLaunchTemplateById,
  type CampaignLaunchTemplate,
} from "@/lib/admin/campaigns/launch-templates";
import { useCreateCampaignMutation } from "@/hooks/admin/campaigns";
import type { LaunchModalStep } from "./types";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useCampaignLaunchModal(
  isOpen: boolean,
  onClose: () => void,
  onCreated?: () => void,
) {
  const createCampaignMutation = useCreateCampaignMutation();
  const [step, setStep] = useState<LaunchModalStep>("template");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templates, setTemplates] = useState<CampaignLaunchTemplate[]>([]);

  const methods = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema) as Resolver<CampaignFormValues>,
    defaultValues: defaultCampaignFormValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;
    setTemplates(getCampaignLaunchTemplates());
    setStep("template");
    setTemplateId(null);
    methods.reset(defaultCampaignFormValues);
    setIsSubmitting(false);
  }, [isOpen, methods]);

  const selectedTemplate = useMemo(
    () => getLaunchTemplateById(templateId) ?? templates.find((item) => item.id === templateId),
    [templateId, templates],
  );

  const handleSelectTemplate = (id: string) => {
    setTemplateId(id);
    const template = templates.find((item) => item.id === id) ?? getLaunchTemplateById(id);
    if (template) methods.reset(template.prefill);
  };

  const handleContinue = async () => {
    if (step === "template") {
      if (!templateId) {
        toast.error("Select a campaign template to continue");
        return;
      }
      setStep("schedule");
      return;
    }

    if (step === "schedule") {
      const scheduleValid = await methods.trigger(["startsAt", "endsAt"]);
      if (!scheduleValid) {
        toast.error("Set a valid start and end date");
        return;
      }
      const values = methods.getValues();
      if (values.startsAt && values.endsAt && values.endsAt < values.startsAt) {
        toast.error("End date must be on or after start date");
        return;
      }
      setStep("review");
    }
  };

  const handleBack = () => {
    if (step === "schedule") setStep("template");
    if (step === "review") setStep("schedule");
  };

  const commit = async (mode: "launch" | "schedule") => {
    const scheduleValid = await methods.trigger(["startsAt", "endsAt"]);
    if (!scheduleValid) {
      toast.error("Set a valid start and end date");
      setStep("schedule");
      return;
    }

    const values = methods.getValues();
    if (values.startsAt && values.endsAt && values.endsAt < values.startsAt) {
      toast.error("End date must be on or after start date");
      setStep("schedule");
      return;
    }

    if (
      !values.name.trim() ||
      values.promotionIds.length === 0 ||
      values.collectionIds.length === 0
    ) {
      toast.error("Choose a campaign template that already has promotions and collections");
      setStep("template");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCampaignMutation.mutateAsync({
        ...values,
        status: mode === "launch" ? "Active" : "Scheduled",
        startsAt: mode === "launch" ? todayIso() : values.startsAt,
      });
      toast.success(
        mode === "launch"
          ? `Campaign “${values.name}” is live`
          : `Campaign “${values.name}” scheduled`,
      );
      onCreated?.();
      onClose();
    } catch {
      toast.error("Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    methods,
    templates,
    templateId,
    selectedTemplate,
    isSubmitting,
    handleSelectTemplate,
    handleContinue,
    handleBack,
    commit,
  };
}
