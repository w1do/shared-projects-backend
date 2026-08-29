/** Оператор проекта в разделе «Команда». */
export interface TeamUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "staff";
  position: string;
  phone: string;
  avatar?: string;
  status: "active" | "inactive";
  lastLogin?: string;
}
