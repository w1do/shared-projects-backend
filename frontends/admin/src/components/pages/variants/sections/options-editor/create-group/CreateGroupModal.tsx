"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/overlay/dialog";
import { Select } from "@/components/ui/inputs/select";
import { Label } from "@/components/ui/inputs/label";
import { Button } from "@/components/ui/inputs/button";
import type { ProductFull } from "@/lib/admin/mocks/types";
import type { ProductVariantConfig, ProductVariantOption } from "@/lib/admin/mocks/variants";
import {
  variantGroupSchema,
  type VariantGroupFormValues,
} from "@/lib/admin/schemas/catalog/variant-group-schema";
import { CreateGroupDimensionsEditor } from "./CreateGroupDimensionsEditor";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductFull[];
  configs: ProductVariantConfig[];
  onCreateGroup: (productId: string, options: ProductVariantOption[]) => void;
}

const defaultValues: VariantGroupFormValues = {
  groupName: "",
  options: [],
};

export function CreateGroupModal({
  isOpen,
  onClose,
  products,
  configs,
  onCreateGroup,
}: CreateGroupModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<VariantGroupFormValues>({
    resolver: zodResolver(variantGroupSchema) as Resolver<VariantGroupFormValues>,
    defaultValues,
    mode: "onChange",
  });

  const options = watch("options") ?? [];

  useEffect(() => {
    if (!isOpen) {
      reset(defaultValues);
    }
  }, [isOpen, reset]);

  const unconfiguredProducts = useMemo(() => {
    const configuredIds = new Set(configs.map((c) => c.productId.toLowerCase()));
    return products.filter((p) => !configuredIds.has(p.id.toLowerCase()));
  }, [products, configs]);

  const selectOptions = useMemo(() => {
    return unconfiguredProducts.map((p) => ({
      value: p.id,
      label: p.name,
      image: p.image,
    }));
  }, [unconfiguredProducts]);

  const onSubmit = (data: VariantGroupFormValues) => {
    onCreateGroup(data.groupName, data.options ?? []);
  };

  const hasUnconfigured = selectOptions.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg" className="flex flex-col gap-6">
        <DialogHeader className="border-b border-border/40 pb-4">
          <DialogTitle>Configure Product Variants</DialogTitle>
          <DialogDescription>
            Select a product to link and define its initial variant options and dimensions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 overflow-y-auto pr-2 max-h-dialog-scroll">
            <div className="flex flex-col gap-2">
              <Label>Target Product</Label>
              {hasUnconfigured ? (
                <>
                  <Controller
                    name="groupName"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        options={selectOptions}
                        placeholder="Choose a product to configure variants..."
                        error={errors.groupName?.message}
                      />
                    )}
                  />
                  <p className="text-caption text-muted-foreground-lighter leading-relaxed">
                    Only products currently without configured variants are displayed.
                  </p>
                </>
              ) : (
                <div className="p-4 rounded-2xl border border-dashed border-border bg-muted/20 text-center text-caption text-muted-foreground-lighter">
                  All catalog products currently have variant configurations.
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Variant Dimensions</Label>
              <CreateGroupDimensionsEditor
                options={options}
                onChangeOptions={(next) =>
                  setValue("options", next, { shouldDirty: true, shouldValidate: true })
                }
              />
              <p className="text-caption text-muted-foreground-lighter leading-relaxed">
                Define dimensions (e.g. Volume, Shade, Scent) for the variants of this product.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-2 border-t border-border/20">
            <Button type="button" variant="outlined" shape="circle" onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              shape="circle"
              disabled={!isValid || !hasUnconfigured}
              size="sm"
            >
              Configure Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
