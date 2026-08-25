import * as React from "react";
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/navigation/pagination";

interface PaginationProps {
  count: number;
  page: number;
  onChange: (page: number) => void;
  variant?: "contained" | "outlined" | "soft" | "ghost" | "text";
  color?: "primary" | "secondary" | "surface" | "warning" | "info" | "error" | "success";
  shape?: "rounded" | "rectangle" | "circle";
}

export function Pagination({
  count,
  page,
  onChange,
  variant,
  color = "primary",
  shape = "rounded",
}: PaginationProps) {
  if (count <= 1) return null;

  const handlePageChange = (e: React.MouseEvent, pageNum: number) => {
    e.preventDefault();
    if (pageNum >= 1 && pageNum <= count) {
      onChange(pageNum);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers: (number | "ellipsis")[] = [];

    if (count <= 5) {
      for (let i = 1; i <= count; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      const start = Math.max(2, page - 1);
      const end = Math.min(count - 1, page + 1);

      if (start > 2) {
        pageNumbers.push("ellipsis");
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (end < count - 1) {
        pageNumbers.push("ellipsis");
      }

      pageNumbers.push(count);
    }

    return pageNumbers;
  };

  return (
    <ShadcnPagination className="mx-0 w-auto">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => handlePageChange(e, page - 1)}
            color={color}
            variant={variant}
            shape={shape}
            className={page === 1 ? "pointer-events-none opacity-30" : undefined}
          />
        </PaginationItem>

        {getPageNumbers().map((pageNum, idx) => (
          <PaginationItem key={idx}>
            {pageNum === "ellipsis" ? (
              <PaginationEllipsis className="select-none text-muted-foreground-lighter" />
            ) : (
              <PaginationLink
                href="#"
                isActive={pageNum === page}
                onClick={(e) => handlePageChange(e, pageNum)}
                color={color}
                variant={variant}
                shape={shape}
              >
                {pageNum}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => handlePageChange(e, page + 1)}
            color={color}
            variant={variant}
            shape={shape}
            className={page === count ? "pointer-events-none opacity-30" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </ShadcnPagination>
  );
}
