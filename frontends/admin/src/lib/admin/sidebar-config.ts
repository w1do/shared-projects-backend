import {
  LayoutDashboard,
  Package,
  Link2,
  Sparkles,
  FolderTree,
  Layers,
  Boxes,
  ShoppingBag,
  Users,
  BadgePercent,
  LifeBuoy,
  Newspaper,
  FileText,
  Bell,
  Settings,
  Plus,
  Tag,
  Upload,
  Megaphone,
  UserPlus,
} from "lucide-react";

import { t } from "@/lib/admin/console-texts";

export const quickActions = [
  {
    title: t("console.quick-actions.add-product"),
    icon: Plus,
    url: "/admin/products/add",
    section: "products",
  },
  {
    title: t("console.quick-actions.new-promotion"),
    icon: Tag,
    action: "new-promotion",
    section: "promotions",
  },
  {
    title: t("console.quick-actions.import-inventory"),
    icon: Upload,
    section: "inventory",
  },
  {
    title: t("console.quick-actions.create-collection"),
    icon: Layers,
    url: "/admin/collections/add",
    section: "collections",
  },
  {
    title: t("console.quick-actions.launch-campaign"),
    icon: Megaphone,
    action: "launch-campaign",
    section: "campaigns",
  },
  {
    title: t("console.quick-actions.invite-teammate"),
    icon: UserPlus,
    action: "invite-teammate",
    section: "team",
  },
];

export const sections = [
  {
    label: t("console.nav.group.overview"),
    items: [
      {
        title: t("console.nav.dashboard"),
        url: "/admin",
        icon: LayoutDashboard,
        section: "dashboard",
      },
    ],
  },
  {
    label: t("console.nav.group.catalog"),
    items: [
      {
        title: t("console.nav.products"),
        url: "/admin/products",
        icon: Package,
        section: "products",
      },
      {
        title: t("console.nav.variants"),
        url: "/admin/variants",
        icon: Link2,
        section: "variants",
      },
      {
        title: t("console.nav.brands"),
        url: "/admin/brands",
        icon: Sparkles,
        section: "brands",
      },
      {
        title: t("console.nav.categories"),
        url: "/admin/categories",
        icon: FolderTree,
        section: "categories",
      },
      {
        title: t("console.nav.collections"),
        url: "/admin/collections",
        icon: Layers,
        section: "collections",
      },
      {
        title: t("console.nav.inventory"),
        url: "/admin/inventory",
        icon: Boxes,
        section: "inventory",
      },
    ],
  },
  {
    label: t("console.nav.group.commerce"),
    items: [
      {
        title: t("console.nav.orders"),
        url: "/admin/orders",
        icon: ShoppingBag,
        section: "orders",
      },
      {
        title: t("console.nav.customers"),
        url: "/admin/customers",
        icon: Users,
        section: "customers",
      },
      {
        title: t("console.nav.campaigns"),
        url: "/admin/campaigns",
        icon: Megaphone,
        section: "campaigns",
      },
      {
        title: t("console.nav.promotions"),
        url: "/admin/promotions",
        icon: BadgePercent,
        section: "promotions",
      },
      {
        title: t("console.nav.support"),
        url: "/admin/support",
        icon: LifeBuoy,
        section: "support",
      },
    ],
  },
  {
    label: t("console.nav.group.workspace"),
    items: [
      {
        title: t("console.nav.blogs"),
        url: "/admin/blogs",
        icon: Newspaper,
        section: "blogs",
      },
      {
        title: t("console.nav.notifications"),
        url: "/admin/notifications",
        icon: Bell,
        section: "notifications",
      },
      {
        title: t("console.nav.team"),
        url: "/admin/team",
        icon: Users,
        section: "team",
      },
      {
        title: t("console.nav.settings"),
        url: "/admin/settings",
        icon: Settings,
        section: "settings",
      },
    ],
  },
];
