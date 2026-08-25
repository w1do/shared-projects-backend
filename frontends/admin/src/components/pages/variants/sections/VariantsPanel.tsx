"use client";

import type { ProductVariantConfig } from "@/lib/admin/mocks/variants";
import { VariantGroupsHeader } from "./VariantGroupsHeader";
import { VariantGroupsStats } from "./VariantGroupsStats";
import { VariantsProductSelector } from "./product-selector";
import { VariantOptionsEditor } from "./options-editor";
import { VariantMatrixTable } from "./matrix-table";
import { StorefrontPreview } from "./storefront-preview";
import { CreateGroupModal } from "./options-editor/create-group/CreateGroupModal";
import { useVariantsPanel } from "@/components/pages/variants/hooks/use-variants-panel";
import { useProductsQuery } from "@/hooks/admin/products";

export function VariantsPanel({
  initialConfigs: initialApiConfigs = [],
}: {
  initialConfigs?: ProductVariantConfig[];
}) {
  const { data: products = [] } = useProductsQuery();
  const {
    configs,
    selectedProductId,
    activeConfig,
    statsGroups,
    isCreateModalOpen,
    setSelectedProductId,
    setIsCreateModalOpen,
    handleOptionsChange,
    handleItemsChange,
    handleSaveMatrix,
    handleCreateGroup,
    handleDeleteConfig,
  } = useVariantsPanel(initialApiConfigs);

  return (
    <div className="flex flex-col gap-8">
      <VariantGroupsHeader onCreateClick={() => setIsCreateModalOpen(true)} />
      <VariantGroupsStats groups={statsGroups} products={products} />

      {activeConfig ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left sidebar: Storefront Live Preview and Product selector */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-8">
            <StorefrontPreview
              options={activeConfig.options}
              items={activeConfig.items}
              productName={activeConfig.productName}
              productImage={activeConfig.productImage}
            />
            <VariantsProductSelector
              configs={configs}
              selectedProductId={selectedProductId}
              onSelectProduct={setSelectedProductId}
              onDeleteConfig={handleDeleteConfig}
            />
          </div>

          {/* Right workspace: Options and Combinations builders */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <VariantOptionsEditor
              options={activeConfig.options}
              onOptionsChange={handleOptionsChange}
            />

            <VariantMatrixTable
              items={activeConfig.items}
              onItemsChange={handleItemsChange}
              baseProductName={activeConfig.productName}
              onSave={handleSaveMatrix}
              maxTotalStock={activeConfig.maxTotalStock}
              options={activeConfig.options}
              baseImage={activeConfig.productImage}
              productId={activeConfig.productId}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border/70 bg-card p-10 text-center text-caption text-muted-foreground">
          No API-backed variant groups are available yet.
        </div>
      )}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        products={products}
        configs={configs}
        onCreateGroup={(productId, options) => {
          const matched = products.find((p) => p.id === productId);
          const pName = matched ? matched.name : "Product";
          handleCreateGroup(productId, pName, options);
        }}
      />
    </div>
  );
}
