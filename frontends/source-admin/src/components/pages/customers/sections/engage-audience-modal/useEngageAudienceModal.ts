"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { DetailedCustomer } from "@/lib/admin/mocks/customers";
import { useCampaignsQuery } from "@/hooks/admin/campaigns";
import { usePromotionsQuery } from "@/hooks/admin/promotions";
import {
  defaultEngageAudienceFormValues,
  engageAudienceSchema,
  type EngageAudienceFormValues,
  type EngageIntent,
} from "@/lib/admin/schemas/content/engage-audience-schema";
import { intentOptions, type EngageModalStep } from "./types";
import { t } from "@/lib/admin/console-texts";

export function useEngageAudienceModal(
  isOpen: boolean,
  customers: DetailedCustomer[],
  onClose: () => void,
  onSent?: () => void,
) {
  const [step, setStep] = useState<EngageModalStep>("audience");
  const [audienceIds, setAudienceIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: campaigns = [] } = useCampaignsQuery();
  const { data: promotionCatalog = [] } = usePromotionsQuery();

  const methods = useForm<EngageAudienceFormValues>({
    resolver: zodResolver(engageAudienceSchema) as Resolver<EngageAudienceFormValues>,
    defaultValues: defaultEngageAudienceFormValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;
    setStep("audience");
    setAudienceIds(customers.map((customer) => customer.id));
    methods.reset(defaultEngageAudienceFormValues);
    setIsSubmitting(false);
  }, [isOpen, customers, methods]);

  const audienceCustomers = useMemo(
    () => customers.filter((customer) => audienceIds.includes(customer.id)),
    [customers, audienceIds],
  );

  const promotions = useMemo(
    () =>
      promotionCatalog.filter((promo) => promo.status === "Active" || promo.status === "Scheduled"),
    [promotionCatalog],
  );

  const coupons = useMemo(
    () =>
      promotionCatalog.filter(
        (promo) =>
          (promo.status === "Active" || promo.status === "Scheduled") &&
          (promo.type === "Percentage" ||
            promo.type === "Fixed Amount" ||
            promo.type === "Free Shipping"),
      ),
    [promotionCatalog],
  );

  const handleRemoveAudience = (id: string) => {
    setAudienceIds((prev) => prev.filter((item) => item !== id));
  };

  const handleSelectIntent = (intent: EngageIntent) => {
    methods.setValue("intent", intent, { shouldValidate: true });
    methods.setValue("campaignId", "", { shouldValidate: false });
    methods.setValue("promotionId", "", { shouldValidate: false });
    methods.setValue("loyaltyTier", undefined, { shouldValidate: false });
    methods.setValue("subject", "", { shouldValidate: false });
  };

  const handleContinue = async () => {
    if (step === "audience") {
      if (audienceCustomers.length === 0) {
        toast.error(t("console.engage.toast.select-customer"));
        return;
      }
      setStep("intent");
      return;
    }

    if (step === "intent") {
      const intent = methods.getValues("intent");
      if (!intent) {
        toast.error(t("console.engage.toast.choose-intent"));
        return;
      }
      setStep("configure");
      return;
    }

    if (step === "configure") {
      const valid = await methods.trigger();
      if (!valid) {
        toast.error(t("console.engage.toast.complete-before-review"));
        return;
      }
      setStep("review");
    }
  };

  const handleBack = () => {
    if (step === "intent") setStep("audience");
    if (step === "configure") setStep("intent");
    if (step === "review") setStep("configure");
  };

  const commit = async (mode: "send" | "schedule") => {
    if (audienceCustomers.length === 0) {
      toast.error(t("console.engage.toast.select-customer-short"));
      setStep("audience");
      return;
    }

    const valid = await methods.trigger();
    if (!valid) {
      toast.error(t("console.engage.toast.complete-before-send"));
      setStep("configure");
      return;
    }

    const values = methods.getValues();
    if (mode === "schedule" && !values.scheduleAt) {
      toast.error(t("console.engage.toast.pick-schedule"));
      setStep("configure");
      return;
    }

    setIsSubmitting(true);
    try {
      const intentLabel =
        intentOptions.find((item) => item.id === values.intent)?.title ??
        t("console.engage.intent.fallback");
      const count = audienceCustomers.length;

      await new Promise((resolve) => setTimeout(resolve, 700));

      toast.success(
        mode === "send"
          ? t("console.engage.toast.queued")
              .replace("{intent}", intentLabel)
              .replace("{count}", String(count))
          : t("console.engage.toast.scheduled")
              .replace("{intent}", intentLabel)
              .replace("{date}", values.scheduleAt ?? ""),
        {
          description: t("console.engage.toast.mock-description"),
        },
      );
      onSent?.();
      onClose();
    } catch {
      toast.error(t("console.engage.toast.failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const intent = methods.watch("intent");

  return {
    step,
    methods,
    audienceCustomers,
    campaigns,
    promotions,
    coupons,
    intent,
    isSubmitting,
    handleRemoveAudience,
    handleSelectIntent,
    handleContinue,
    handleBack,
    commit,
  };
}
