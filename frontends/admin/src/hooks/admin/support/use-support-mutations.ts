"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SupportTicket, TicketStatus } from "@/lib/admin/mocks/support";
import { addTicketMessage, markTicketRead, updateTicketStatus } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

async function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: adminQueryKeys.support.all });
}

export function useUpdateTicketStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TicketStatus }) =>
      updateTicketStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.support.all });
      const previous = queryClient.getQueryData<SupportTicket[]>(adminQueryKeys.support.list());
      queryClient.setQueryData<SupportTicket[]>(adminQueryKeys.support.list(), (current = []) =>
        current.map((ticket) =>
          ticket.id === id
            ? { ...ticket, status, updatedAt: new Date().toISOString(), unread: false }
            : ticket,
        ),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(adminQueryKeys.support.list(), ctx.previous);
    },
    onSettled: async () => invalidate(queryClient),
  });
}

export function useAddTicketMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => addTicketMessage(id, body),
    onMutate: async ({ id, body }) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.support.all });
      const previous = queryClient.getQueryData<SupportTicket[]>(adminQueryKeys.support.list());
      const now = new Date().toISOString();
      queryClient.setQueryData<SupportTicket[]>(adminQueryKeys.support.list(), (current = []) =>
        current.map((ticket) => {
          if (ticket.id !== id) return ticket;
          return {
            ...ticket,
            updatedAt: now,
            unread: false,
            messages: [
              ...ticket.messages,
              {
                id: `msg-${Date.now()}`,
                author: "agent" as const,
                authorName: "You",
                body,
                sentAt: now,
              },
            ],
          };
        }),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(adminQueryKeys.support.list(), ctx.previous);
    },
    onSettled: async () => invalidate(queryClient),
  });
}

export function useMarkTicketReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markTicketRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.support.all });
      const previous = queryClient.getQueryData<SupportTicket[]>(adminQueryKeys.support.list());
      queryClient.setQueryData<SupportTicket[]>(adminQueryKeys.support.list(), (current = []) =>
        current.map((ticket) => (ticket.id === id ? { ...ticket, unread: false } : ticket)),
      );
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(adminQueryKeys.support.list(), ctx.previous);
    },
    onSettled: async () => invalidate(queryClient),
  });
}
