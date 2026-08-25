export type NotificationType =
  | "order"
  | "inventory"
  | "customer"
  | "promotion"
  | "support"
  | "system";

export type AdminNotification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  href?: string;
  actionLabel?: string;
};
