import { Badge } from "@/components/ui/data-display/badge";
import type { Category } from "@/lib/admin/types/catalog";

interface CategoryStatusBadgeProps {
  status: Category["status"];
}

export function CategoryStatusBadge({ status }: CategoryStatusBadgeProps) {
  const colorMap: Record<Category["status"], "success" | "warning" | "neutral"> = {
    Active: "success",
    Draft: "warning",
    Archived: "neutral",
  };

  return (
    <Badge variant="soft" shape="circle" color={colorMap[status]}>
      {status}
    </Badge>
  );
}
