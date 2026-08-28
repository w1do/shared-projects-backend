import { t } from "@/lib/admin/console-texts";
import {
  customerSkinConcernLabel,
  customerSkinTypeLabel,
  customerTierLabel,
} from "@/components/pages/customers/utils";

export const TIER_OPTIONS = [
  { value: "all", label: t("console.customers.filter.all-tiers") },
  { value: "Bronze", label: customerTierLabel("Bronze") },
  { value: "Silver", label: customerTierLabel("Silver") },
  { value: "Gold", label: customerTierLabel("Gold") },
  { value: "Platinum", label: customerTierLabel("Platinum") },
];

export const SKIN_TYPES = [
  { value: "all", label: t("console.customers.filter.all-skin-types") },
  { value: "Dry", label: customerSkinTypeLabel("Dry") },
  { value: "Oily", label: customerSkinTypeLabel("Oily") },
  { value: "Sensitive", label: customerSkinTypeLabel("Sensitive") },
  { value: "Combination", label: customerSkinTypeLabel("Combination") },
  { value: "Normal", label: customerSkinTypeLabel("Normal") },
];

export const SKIN_CONCERNS = [
  { value: "all", label: t("console.customers.filter.all-concerns") },
  { value: "Acne", label: customerSkinConcernLabel("Acne") },
  { value: "Aging", label: customerSkinConcernLabel("Aging") },
  { value: "Hydration", label: customerSkinConcernLabel("Hydration") },
  { value: "Redness", label: customerSkinConcernLabel("Redness") },
  { value: "Brightening", label: customerSkinConcernLabel("Brightening") },
];
