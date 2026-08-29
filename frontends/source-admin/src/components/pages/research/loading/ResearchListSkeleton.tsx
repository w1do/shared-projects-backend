import { Card } from "@/components/ui/data-display/card";
import { Skeleton } from "@/components/ui/data-display/skeleton";

/** Скелетон повторяет разметку списка исследований: карточка-секция и строки. */
export function ResearchListSkeleton() {
  return (
    <div className="flex flex-col gap-6" data-testid="research-list-skeleton">
      <Card variant="form-section">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
      </Card>

      <Card variant="form-section">
        {[0, 1, 2].map((index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        ))}
      </Card>
    </div>
  );
}
