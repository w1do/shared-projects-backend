import type { DetailedOrder } from "@/lib/admin/mocks/orders";

export function updateOrderTimeline(
  order: DetailedOrder,
  newStatus: DetailedOrder["status"],
): DetailedOrder {
  const nowString = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let updatedTimeline = [...order.timeline];

  if (newStatus === "Paid") {
    updatedTimeline = updatedTimeline.map((step) =>
      step.title === "Payment Confirmed" ? { ...step, done: true, timestamp: nowString } : step,
    );
  } else if (newStatus === "Processing") {
    updatedTimeline = updatedTimeline.map((step) =>
      step.title === "Fulfillment in Progress" || step.title === "Processing Fulfillment"
        ? { ...step, done: true, timestamp: nowString }
        : step,
    );
  } else if (newStatus === "Shipped") {
    updatedTimeline = updatedTimeline.map((step) => {
      if (
        step.title.includes("Processing") ||
        step.title.includes("Fulfillment") ||
        step.title.includes("Ready")
      ) {
        return {
          ...step,
          done: true,
          timestamp: step.timestamp === "Pending" ? nowString : step.timestamp,
        };
      }
      if (step.title.includes("Shipped") || step.title.includes("Dispatch")) {
        return {
          ...step,
          done: true,
          timestamp: nowString,
          description: "Handed over to carrier. Courier tracking code generated.",
        };
      }
      return step;
    });
  } else if (newStatus === "Refunded") {
    updatedTimeline.push({
      title: "Refund Initiated",
      timestamp: nowString,
      description: "Returned payment to client account successfully.",
      done: true,
    });
  }

  return {
    ...order,
    status: newStatus,
    trackingNumber:
      newStatus === "Shipped" ? order.trackingNumber || "TRACK-AETH-88204" : order.trackingNumber,
    timeline: updatedTimeline,
  };
}

export const formatPlacedTime = (isoString: string) => {
  const placedDate = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - placedDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 60) {
    return diffMins <= 0 ? "Just now" : `${diffMins} min ago`;
  } else if (diffHours < 24) {
    return `${diffHours} h ago`;
  }
  return placedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function ordersFilterFn(
  o: DetailedOrder,
  q: string,
  s: DetailedOrder["status"] | "all",
): boolean {
  const matchesSearch =
    o.id.toLowerCase().includes(q.toLowerCase()) ||
    o.customer.name.toLowerCase().includes(q.toLowerCase()) ||
    o.customer.email.toLowerCase().includes(q.toLowerCase()) ||
    o.items.some((item) => item.name.toLowerCase().includes(q.toLowerCase()));

  const matchesStatus = s === "all" || o.status === s;

  return matchesSearch && matchesStatus;
}

export function ordersSortFn(
  items: DetailedOrder[],
  config: { field: "placedAt" | "total"; order: "asc" | "desc" },
): DetailedOrder[] {
  return [...items].sort((a, b) => {
    const orderMultiplier = config.order === "asc" ? 1 : -1;
    const field = config.field;
    if (field === "placedAt") {
      return (new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime()) * orderMultiplier;
    }
    if (field === "total") {
      return (a.total - b.total) * orderMultiplier;
    }
    return 0;
  });
}
