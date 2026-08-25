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

export const quickActions = [
  { title: "Add product", icon: Plus, url: "/admin/products/add", section: "products" },
  { title: "New promotion", icon: Tag, action: "new-promotion", section: "promotions" },
  { title: "Import inventory", icon: Upload, section: "inventory" },
  {
    title: "Create collection",
    icon: Layers,
    url: "/admin/collections/add",
    section: "collections",
  },
  { title: "Launch campaign", icon: Megaphone, action: "launch-campaign", section: "campaigns" },
  { title: "Invite teammate", icon: UserPlus, action: "invite-teammate", section: "team" },
];

export const sections = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/admin", icon: LayoutDashboard, section: "dashboard" }],
  },
  {
    label: "Catalog",
    items: [
      { title: "Products", url: "/admin/products", icon: Package, section: "products" },
      { title: "Variants", url: "/admin/variants", icon: Link2, section: "variants" },
      { title: "Brands", url: "/admin/brands", icon: Sparkles, section: "brands" },
      { title: "Categories", url: "/admin/categories", icon: FolderTree, section: "categories" },
      { title: "Collections", url: "/admin/collections", icon: Layers, section: "collections" },
      { title: "Inventory", url: "/admin/inventory", icon: Boxes, section: "inventory" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { title: "Orders", url: "/admin/orders", icon: ShoppingBag, section: "orders" },
      { title: "Customers", url: "/admin/customers", icon: Users, section: "customers" },
      { title: "Campaigns", url: "/admin/campaigns", icon: Megaphone, section: "campaigns" },
      { title: "Promotions", url: "/admin/promotions", icon: BadgePercent, section: "promotions" },
      { title: "Support", url: "/admin/support", icon: LifeBuoy, section: "support" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Blogs", url: "/admin/blogs", icon: Newspaper, section: "blogs" },
      { title: "Notifications", url: "/admin/notifications", icon: Bell, section: "notifications" },
      { title: "Team", url: "/admin/team", icon: Users, section: "team" },
      { title: "Settings", url: "/admin/settings", icon: Settings, section: "settings" },
    ],
  },
];
