"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/overlay/dialog";
import { ScrollArea } from "@/components/ui/layout/scroll-area";
import { Separator } from "@/components/ui/data-display/separator";
import { Avatar } from "@/components/ui/data-display/avatar";
import { Badge } from "@/components/ui/data-display/badge";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import type { DetailedCustomer } from "@/lib/admin/mocks/customers";

// Sections
import { ContactSection } from "./sections/contact";
import { AddressesSection } from "./sections/addresses";
import { RecentOrdersSection } from "./sections/recent-orders";
import { ActivitiesLogSection } from "./sections/activities-log";

interface CustomerDetailModalProps {
  customer: DetailedCustomer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerDetailModal({ customer, isOpen, onClose }: CustomerDetailModalProps) {
  if (!customer) return null;
  const gradientId = `customer-detail-${customer.id}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AdminDynamicStyles
        gradients={[
          {
            id: gradientId,
            start: customer.gradient[0],
            end: customer.gradient[1],
          },
        ]}
      />
      <DialogContent size="wide" padding="none" radius="3xl" scroll className="overflow-hidden">
        <div className="flex flex-col max-h-modal-scroll min-h-0 w-full">
          {/* Header Section */}
          <DialogHeader className="border-b border-border/50 p-6 pb-4 text-left flex-shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar src={customer.avatarUrl} data-admin-gradient={gradientId}>
                  {customer.avatar}
                </Avatar>
                <div className="flex flex-col gap-2">
                  <DialogTitle className="flex items-center gap-2 text-heading font-semibold">
                    {customer.name}
                    <Badge variant="soft" shape="circle" color="primary">
                      {customer.tier} Tier
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-caption text-muted-foreground-lighter">
                    Customer ID: {customer.id} &bull; Member since{" "}
                    {new Date(customer.joinedAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* 2-Column Body with Scroll Area */}
          <ScrollArea className="flex-1 px-6 min-h-0">
            <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left Column: Personal info & Skin Profile & Addresses */}
              <div className="md:col-span-7 flex flex-col gap-8">
                <ContactSection customer={customer} />
                <AddressesSection customer={customer} />
              </div>

              {/* Right Column: Order History & Activity Log */}
              <div className="md:col-span-5 flex flex-col gap-8">
                {/* Purchase Summary KPI */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-border/60 p-4 flex flex-col gap-2">
                    <span className="text-caption font-medium text-muted-foreground-lighter uppercase">
                      Total Spent
                    </span>
                    <span className="text-heading font-semibold font-sans">
                      ${customer.totalSpent.toFixed(2)}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-border/60 p-4 flex flex-col gap-2">
                    <span className="text-caption font-medium text-muted-foreground-lighter uppercase">
                      Total Orders
                    </span>
                    <span className="text-heading font-semibold font-sans">
                      {customer.totalOrders} items
                    </span>
                  </div>
                </div>

                <Separator />

                <RecentOrdersSection customer={customer} />

                <Separator />

                <ActivitiesLogSection customer={customer} />
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
