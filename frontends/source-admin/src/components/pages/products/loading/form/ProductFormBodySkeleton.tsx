import {
  CollectionsSectionSkeleton,
  ContentBlocksSectionSkeleton,
  GeneralInfoSectionSkeleton,
  MediaSectionSkeleton,
  PricingSectionSkeleton,
  SidebarSettingsSkeleton,
  StatusSectionSkeleton,
  ThumbnailSectionSkeleton,
  VariantLinksSectionSkeleton,
} from "./sections";

/**
 * Mirrors ProductFormBody two-column layout exactly:
 * left (lg:col-span-2) sections + right sticky sidebar (thumbnail/status/org).
 */
export function ProductFormBodySkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="flex flex-col gap-8 lg:col-span-2">
        <GeneralInfoSectionSkeleton />
        <MediaSectionSkeleton />
        <PricingSectionSkeleton />
        <CollectionsSectionSkeleton />
        <ContentBlocksSectionSkeleton />
        <VariantLinksSectionSkeleton />
      </div>

      <div className="lg:col-span-1">
        <div className="flex flex-col gap-6 lg:sticky lg:top-32">
          <ThumbnailSectionSkeleton />
          <StatusSectionSkeleton />
          <SidebarSettingsSkeleton />
        </div>
      </div>
    </div>
  );
}
