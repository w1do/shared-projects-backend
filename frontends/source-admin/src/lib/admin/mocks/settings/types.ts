export type CurrencyCode = "USD" | "EUR" | "GBP" | "VND";
export type WeightUnit = "kg" | "lb";
export type TeamRole = "Owner" | "Admin" | "Manager" | "Staff";
export type MemberStatus = "active" | "invited";

export interface GeneralSettings {
  storeName: string;
  supportEmail: string;
  phone: string;
  description: string;
  currency: CurrencyCode;
  timezone: string;
  weightUnit: WeightUnit;
  storefrontUrl?: string;
}

export interface NotificationPref {
  id: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: MemberStatus;
  avatar?: string;
}

export interface SecuritySettings {
  twoFactor: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
}

export interface StoreSettings {
  general: GeneralSettings;
  notifications: NotificationPref[];
  team: TeamMember[];
  security: SecuritySettings;
}
