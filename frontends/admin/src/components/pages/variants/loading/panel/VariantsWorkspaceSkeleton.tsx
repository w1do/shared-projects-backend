import { MatrixTableSkeleton } from "./MatrixTableSkeleton";
import { OptionsEditorSkeleton } from "./OptionsEditorSkeleton";
import { ProductSelectorSkeleton } from "./ProductSelectorSkeleton";
import { StorefrontPreviewSkeleton } from "./StorefrontPreviewSkeleton";

/**
 * Mirrors VariantsPanel workspace when an active config exists:
 * left sticky preview + selector, right dimensions + matrix.
 */
export function VariantsWorkspaceSkeleton() {
  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
      <div className="flex flex-col gap-8 lg:col-span-4 lg:sticky lg:top-24">
        <StorefrontPreviewSkeleton />
        <ProductSelectorSkeleton />
      </div>
      <div className="flex flex-col gap-8 lg:col-span-8">
        <OptionsEditorSkeleton />
        <MatrixTableSkeleton />
      </div>
    </div>
  );
}
