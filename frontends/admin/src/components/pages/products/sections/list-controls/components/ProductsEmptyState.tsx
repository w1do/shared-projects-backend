import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";

export function ProductsEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex min-h-24 flex-col items-center justify-center gap-4 rounded-3xl bg-muted p-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-subtle-3">
        <PackageSearch className="h-6 w-6 text-ring" />
      </div>
      <div>
        <div className="font-openrunde text-heading text-foreground">No products match</div>
        <p className="mt-2 max-w-sm text-body text-muted-foreground">
          Try a different search term or clear the active filters to see the full catalog.
        </p>
      </div>
      <Button variant="contained" color="surface" size="lg" shape="circle" onClick={onReset}>
        Clear filters
      </Button>
    </div>
  );
}
