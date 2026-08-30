import {
  LayoutDashboard,
  FolderTree,
  Users,
  Newspaper,
  Search,
  ListChecks,
  Settings,
  KeyRound,
  UserPlus,
  Building2,
  CreditCard,
  Layers,
  Package,
  RefreshCw,
  Globe,
  MapPin,
} from "lucide-react";

import { t } from "@/lib/admin/console-texts";

export const quickActions = [
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
    label: t("console.nav.group.content"),
    items: [
      {
        title: t("console.nav.blogs"),
        url: "/admin/blogs",
        icon: Newspaper,
        section: "blogs",
      },
      {
        title: t("console.nav.categories"),
        url: "/admin/categories",
        icon: FolderTree,
        section: "categories",
      },
      {
        title: t("console.nav.research"),
        url: "/admin/research",
        icon: Search,
        section: "research",
      },
      {
        title: t("console.nav.instructs"),
        url: "/admin/instructs",
        icon: ListChecks,
        section: "instructs",
      },
      {
        title: t("console.nav.seo"),
        url: "/admin/seo",
        icon: Globe,
        section: "seo",
      },
      {
        title: t("console.nav.cities"),
        url: "/admin/cities",
        icon: MapPin,
        section: "cities",
      },
    ],
  },
  {
    label: t("console.nav.group.payments"),
    items: [
      {
        title: t("console.nav.payments"),
        url: "/admin/payments",
        icon: CreditCard,
        section: "payments",
      },
      {
        title: t("console.nav.subscriptions"),
        url: "/admin/subscriptions",
        icon: RefreshCw,
        section: "subscriptions",
      },
      {
        title: t("console.nav.plans"),
        url: "/admin/plans",
        icon: Layers,
        section: "plans",
      },
      {
        title: t("console.nav.license-plans"),
        url: "/admin/license-plans",
        icon: Layers,
        section: "license-plans",
      },
      {
        title: t("console.nav.licenses"),
        url: "/admin/licenses",
        icon: KeyRound,
        section: "licenses",
      },
      {
        title: t("console.nav.organizations"),
        url: "/admin/organizations",
        icon: Building2,
        section: "organizations",
      },
      {
        title: t("console.nav.releases"),
        url: "/admin/releases",
        icon: Package,
        section: "releases",
      },
    ],
  },
  {
    label: t("console.nav.group.workspace"),
    items: [
      {
        title: t("console.nav.customers"),
        url: "/admin/customers",
        icon: Users,
        section: "customers",
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
