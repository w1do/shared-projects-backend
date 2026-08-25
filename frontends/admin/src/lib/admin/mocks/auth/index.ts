import userData from "./data.json";

export interface MockUser {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: "admin" | "manager" | "staff";
  position: string;
  phone: string;
  avatar?: string;
  status: "active" | "inactive";
  lastLogin?: string;
}

export const mockUsers = userData as MockUser[];

// Helper to check credentials and mock authenticate
export function authenticateMockUser(email: string): MockUser | undefined {
  return mockUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
}
