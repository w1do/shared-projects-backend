export type CurrencyCode = "USD" | "EUR" | "GBP" | "VND";
export type WeightUnit = "kg" | "lb";
export type PaymentMode = "live" | "test";
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

export interface PaymentProvider {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  mode: PaymentMode;
}

export interface ShippingZone {
  id: string;
  name: string;
  regions: string;
  rate: number;
  freeThreshold: number | null;
  enabled: boolean;
}

export interface TaxRegion {
  id: string;
  name: string;
  rate: number;
}

export interface TaxSettings {
  pricesIncludeTax: boolean;
  autoCalculate: boolean;
  defaultRate: number;
  taxId: string;
  regions: TaxRegion[];
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
  payments: PaymentProvider[];
  shipping: ShippingZone[];
  taxes: TaxSettings;
  notifications: NotificationPref[];
  team: TeamMember[];
  security: SecuritySettings;
}
