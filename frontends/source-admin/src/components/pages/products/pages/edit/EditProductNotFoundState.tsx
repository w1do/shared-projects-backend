import { Button } from "@/components/ui/inputs/button";

type EditProductNotFoundStateProps = {
  productId: string;
};

/** Friendly empty state when product detail cannot be resolved (API miss or missing mock entry). */
export function EditProductNotFoundState({ productId }: EditProductNotFoundStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-border/60 bg-background p-16 text-center shadow-subtle-3">
      <p className="font-openrunde text-heading text-foreground">Product not found</p>
      <p className="max-w-sm text-caption text-muted-foreground">
        The product “{productId}” could not be located in the catalog. It may have been removed or
        is unavailable in the current data source.
      </p>
      <Button component="Link" href="/admin/products" variant="contained" shape="circle" size="sm">
        Back to products
      </Button>
    </div>
  );
}
