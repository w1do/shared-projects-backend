import { recentSupportTickets } from "./tickets-recent";
import { earlierSupportTickets } from "./tickets-earlier";

export * from "./types";

export const mockSupportTickets = [...recentSupportTickets, ...earlierSupportTickets];
