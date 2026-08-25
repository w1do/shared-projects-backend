import customersData from "./data.json";
import type { DetailedCustomer } from "./types";

export * from "./types";

export const mockDetailedCustomers = customersData as DetailedCustomer[];

export function findCustomerByEmailOrName(query?: string): DetailedCustomer | undefined {
  if (!query) return undefined;
  const q = query.toLowerCase().trim();
  return mockDetailedCustomers.find(
    (c) => c.email.toLowerCase() === q || c.name.toLowerCase() === q,
  );
}
