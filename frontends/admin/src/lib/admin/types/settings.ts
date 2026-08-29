/** Типы раздела «Настройки»: профиль проекта и его операторы. */
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

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: MemberStatus;
  avatar?: string;
}

export interface StoreSettings {
  general: GeneralSettings;
  team: TeamMember[];
}
