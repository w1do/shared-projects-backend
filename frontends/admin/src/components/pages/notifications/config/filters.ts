import {
  ShoppingBag,
  Boxes,
  Users,
  BadgePercent,
  LifeBuoy,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "@/lib/admin/mocks/notifications";

export const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "order", label: "Orders" },
  { value: "inventory", label: "Inventory" },
  { value: "customer", label: "Customers" },
  { value: "promotion", label: "Promotions" },
  { value: "support", label: "Support" },
  { value: "system", label: "System" },
];

export type TypeFilter = NotificationType | "all";

interface TypeConfig {
  icon: LucideIcon;
  /** Background + text tone classes for the icon badge using semantic design tokens. */
  tone: string;
}

export const typeConfig: Record<NotificationType, TypeConfig> = {
  order: { icon: ShoppingBag, tone: "bg-info/10 text-info" },
  inventory: { icon: Boxes, tone: "bg-warning/10 text-warning" },
  customer: { icon: Users, tone: "bg-primary/10 text-primary" },
  promotion: { icon: BadgePercent, tone: "bg-accent text-brand-accent" },
  support: { icon: LifeBuoy, tone: "bg-success/10 text-success" },
  system: { icon: Settings, tone: "bg-muted text-muted-foreground" },
};
