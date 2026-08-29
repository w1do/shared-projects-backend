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
    label: t("console.nav.group.catalog"),
    items: [
      {
        title: t("console.nav.categories"),
        url: "/admin/categories",
        icon: FolderTree,
        section: "categories",
      },
    ],
  },
  {
    label: t("console.nav.group.commerce"),
    items: [
      {
        title: t("console.nav.customers"),
        url: "/admin/customers",
        icon: Users,
        section: "customers",
      },
      {
        title: t("console.nav.licensing"),
        url: "/admin/licensing",
        icon: KeyRound,
        section: "licensing",
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
