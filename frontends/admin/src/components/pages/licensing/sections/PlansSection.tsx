"use client";

import * as React from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/data-display/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/data-display/table";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import {
  useAddLicensingPlanFeatureMutation,
  useCreateLicensingPlanMutation,
  useDeleteLicensingPlanFeatureMutation,
  useDeleteLicensingPlanMutation,
  useLicensingOrganizations,
  useLicensingPlanQuery,
  useLicensingPlans,
  useUpdateLicensingPlanMutation,
} from "@/hooks/admin/licensing";
import type {
  PlatformLicensingPlan,
  UpsertLicensingPlanInput,
} from "@/lib/admin/services/licensing";
import { useConsoleText } from "@/lib/admin/use-console-text";

/** Планы поставки: список, CRUD, фичи и переопределения в просмотре плана. */
export function PlansSection({ canManage }: { canManage: boolean }) {
  const t = useConsoleText();
  const { items, isPending, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useLicensingPlans();
  const deleteMutation = useDeleteLicensingPlanMutation();

  const [formTarget, setFormTarget] = React.useState<
    { mode: "create" } | { mode: "edit"; plan: PlatformLicensingPlan } | null
  >(null);
  const [viewPlanId, setViewPlanId] = React.useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] =
    React.useState<PlatformLicensingPlan | null>(null);

  const intervalLabels = {
    day: t("console.licensing.plans.interval.day"),
    month: t("console.licensing.plans.interval.month"),
    year: t("console.licensing.plans.interval.year"),
  } as const;

  const priceLabel = (plan: PlatformLicensingPlan) =>
    plan.price_minor === null ||
    plan.currency === null ||
    plan.interval === null
      ? t("console.licensing.plans.price.free")
      : `${plan.price_minor} ${plan.currency} / ${intervalLabels[plan.interval]}`;

  return (
    <div className="flex flex-col gap-4" data-testid="licensing-plans">
      {canManage && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="contained"
            color="primary"
            shape="circle"
            size="sm"
            startIcon={<Plus />}
            onClick={() => setFormTarget({ mode: "create" })}
            data-testid="plan-add"
          >
            {t("console.licensing.plans.add")}
          </Button>
        </div>
      )}

      <Table data-testid="plans-table">
        <TableHeader>
          <TableRow>
            <TableHead>{t("console.licensing.plans.table.code")}</TableHead>
            <TableHead>{t("console.licensing.plans.table.name")}</TableHead>
            <TableHead>{t("console.licensing.plans.table.price")}</TableHead>
            <TableHead>{t("console.licensing.plans.table.features")}</TableHead>
            <TableHead className="w-28 text-right">
              {t("console.common.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isPending && items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-8 text-center text-caption text-muted-foreground-lighter"
              >
                {t("console.licensing.plans.empty")}
              </TableCell>
            </TableRow>
          )}
          {items.map((plan) => (
            <TableRow key={plan.id} data-plan={plan.code}>
              <TableCell className="font-medium">{plan.code}</TableCell>
              <TableCell>{plan.name}</TableCell>
              <TableCell>{priceLabel(plan)}</TableCell>
              <TableCell>
                <Badge color="secondary" variant="soft" shape="circle">
                  {plan.features.length}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <IconButton
                    variant="ghost"
                    size="sm"
                    shape="circle"
                    aria-label={t("console.licensing.plans.features.title")}
                    onClick={() => setViewPlanId(plan.id)}
                  >
                    <Eye className="size-4" />
                  </IconButton>
                  {canManage && (
                    <>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        shape="circle"
                        aria-label={t("console.common.edit")}
                        onClick={() => setFormTarget({ mode: "edit", plan })}
                      >
                        <Pencil className="size-4" />
                      </IconButton>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        shape="circle"
                        color="error"
                        aria-label={t("console.common.delete")}
                        onClick={() => setDeleteTarget(plan)}
                      >
                        <Trash2 className="size-4" />
                      </IconButton>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outlined"
            shape="circle"
            size="sm"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {t("console.licensing.load-more")}
          </Button>
        </div>
      )}

      <PlanFormDialog target={formTarget} onClose={() => setFormTarget(null)} />
      <PlanDetailsDialog
        planId={viewPlanId}
        canManage={canManage}
        onClose={() => setViewPlanId(null)}
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent
          size="sm"
          radius="3xl"
          className="flex flex-col items-center text-center"
        >
          <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Trash2 className="size-6" />
          </div>
          <DialogTitle className="text-heading-lg font-semibold">
            {t("console.licensing.plans.delete.title")}
          </DialogTitle>
          <DialogDescription className="mt-2 max-w-xs text-xs text-muted-foreground leading-relaxed">
            {t("console.licensing.plans.delete.description").replace(
              "{name}",
              deleteTarget?.name ?? "",
            )}
          </DialogDescription>
          <div className="mt-6 grid w-full grid-cols-2 gap-4">
            <Button
              variant="outlined"
              shape="circle"
              size="sm"
              fullWidth
              onClick={() => setDeleteTarget(null)}
            >
              {t("console.common.cancel")}
            </Button>
            <Button
              variant="contained"
              color="error"
              shape="circle"
              size="sm"
              fullWidth
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (!deleteTarget) return;
                deleteMutation.mutate(deleteTarget.id, {
                  onSettled: () => setDeleteTarget(null),
                });
              }}
            >
              {t("console.common.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Форма плана: код, название и цена-тройка «все или ничего» с подсказкой. */
function PlanFormDialog({
  target,
  onClose,
}: {
  target:
    | { mode: "create" }
    | { mode: "edit"; plan: PlatformLicensingPlan }
    | null;
  onClose: () => void;
}) {
  const t = useConsoleText();
  const createMutation = useCreateLicensingPlanMutation();
  const updateMutation = useUpdateLicensingPlanMutation();

  const editing = target?.mode === "edit" ? target.plan : null;

  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [priceMinor, setPriceMinor] = React.useState("");
  const [currency, setCurrency] = React.useState("");
  const [interval, setInterval] = React.useState("");

  React.useEffect(() => {
    if (target === null) return;
    setCode(editing?.code ?? "");
    setName(editing?.name ?? "");
    setPriceMinor(editing?.price_minor?.toString() ?? "");
    setCurrency(editing?.currency ?? "");
    setInterval(editing?.interval ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const priceFieldsFilled = [
    priceMinor.trim(),
    currency.trim(),
    interval.trim(),
  ].filter((value) => value !== "").length;
  const priceIncomplete = priceFieldsFilled > 0 && priceFieldsFilled < 3;

  const isPending = createMutation.isPending || updateMutation.isPending;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (priceIncomplete) return;

    const hasPrice = priceFieldsFilled === 3;
    const input: UpsertLicensingPlanInput = {
      code: code.trim(),
      name: name.trim(),
      price_minor: hasPrice ? Number(priceMinor) : null,
      currency: hasPrice ? currency.trim().toUpperCase() : null,
      interval: hasPrice ? (interval as "day" | "month" | "year") : null,
    };

    const options = { onSuccess: onClose };
    if (editing) {
      updateMutation.mutate({ id: editing.id, input }, options);
    } else {
      createMutation.mutate(input, options);
    }
  };

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent scroll data-testid="plan-form">
        <DialogHeader>
          <DialogTitle>
            {editing
              ? t("console.licensing.plans.form.edit-title")
              : t("console.licensing.plans.form.create-title")}
          </DialogTitle>
          <DialogDescription>
            {t("console.licensing.plans.form.price-hint")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="mt-2 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("console.licensing.plans.form.code")}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Input
              label={t("console.licensing.plans.form.name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              type="number"
              min={0}
              label={t("console.licensing.plans.form.price-minor")}
              value={priceMinor}
              onChange={(e) => setPriceMinor(e.target.value)}
            />
            <Input
              label={t("console.licensing.plans.form.currency")}
              placeholder="RUB"
              maxLength={3}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
            <Select
              label={t("console.licensing.plans.form.interval")}
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              options={[
                { value: "", label: "—" },
                {
                  value: "day",
                  label: t("console.licensing.plans.interval.day"),
                },
                {
                  value: "month",
                  label: t("console.licensing.plans.interval.month"),
                },
                {
                  value: "year",
                  label: t("console.licensing.plans.interval.year"),
                },
              ]}
            />
          </div>
          {priceIncomplete && (
            <p
              className="text-caption text-destructive"
              data-testid="plan-price-hint"
            >
              {t("console.licensing.plans.form.price-hint")}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outlined"
              shape="circle"
              size="md"
              onClick={onClose}
            >
              {t("console.common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              shape="circle"
              size="md"
              disabled={isPending || priceIncomplete}
              data-testid="plan-form-submit"
            >
              {t("console.common.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Просмотр плана: базовые фичи и пер-организационные переопределения. */
function PlanDetailsDialog({
  planId,
  canManage,
  onClose,
}: {
  planId: number | null;
  canManage: boolean;
  onClose: () => void;
}) {
  const t = useConsoleText();
  const { data: plan } = useLicensingPlanQuery(planId);
  const { items: organizations } = useLicensingOrganizations();
  const addFeature = useAddLicensingPlanFeatureMutation();
  const removeFeature = useDeleteLicensingPlanFeatureMutation();

  const [featureCode, setFeatureCode] = React.useState("");
  const [featureName, setFeatureName] = React.useState("");
  const [featureOrganization, setFeatureOrganization] = React.useState("");

  React.useEffect(() => {
    if (planId === null) return;
    setFeatureCode("");
    setFeatureName("");
    setFeatureOrganization("");
  }, [planId]);

  const organizationName = (id: number | null) =>
    id === null
      ? t("console.licensing.plans.features.base")
      : (organizations.find((org) => org.id === id)?.name ?? `#${id}`);

  const submitFeature = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      planId === null ||
      featureCode.trim() === "" ||
      featureName.trim() === ""
    )
      return;

    addFeature.mutate(
      {
        planId,
        input: {
          code: featureCode.trim(),
          name: featureName.trim(),
          organization_id:
            featureOrganization === "" ? null : Number(featureOrganization),
        },
      },
      {
        onSuccess: () => {
          setFeatureCode("");
          setFeatureName("");
          setFeatureOrganization("");
        },
      },
    );
  };

  const featureRow = (
    feature: PlatformLicensingPlan["features"][number],
    override: boolean,
  ) => (
    <TableRow key={feature.id} data-feature={feature.code}>
      <TableCell className="font-medium">{feature.code}</TableCell>
      <TableCell>{feature.name}</TableCell>
      <TableCell>{organizationName(feature.organization_id)}</TableCell>
      {canManage && (
        <TableCell className="text-right">
          <IconButton
            variant="ghost"
            size="sm"
            shape="circle"
            color="error"
            aria-label={t("console.common.delete")}
            disabled={removeFeature.isPending}
            onClick={() =>
              planId !== null &&
              removeFeature.mutate({ planId, featureId: feature.id })
            }
          >
            <Trash2 className="size-4" />
          </IconButton>
        </TableCell>
      )}
      {override && null}
    </TableRow>
  );

  return (
    <Dialog open={planId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent scroll size="lg" data-testid="plan-details">
        <DialogHeader>
          <DialogTitle>
            {plan ? `${plan.name} (${plan.code})` : "…"}
          </DialogTitle>
          <DialogDescription>
            {t("console.licensing.plans.features.title")} /{" "}
            {t("console.licensing.plans.features.overrides")}
          </DialogDescription>
        </DialogHeader>

        {plan && (
          <div className="mt-2 flex flex-col gap-6">
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">
                {t("console.licensing.plans.features.title")}
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("console.licensing.plans.features.code")}
                    </TableHead>
                    <TableHead>
                      {t("console.licensing.plans.features.name")}
                    </TableHead>
                    <TableHead>
                      {t("console.licensing.plans.features.organization")}
                    </TableHead>
                    {canManage && (
                      <TableHead className="w-16 text-right">
                        {t("console.common.actions")}
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.features.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={canManage ? 4 : 3}
                        className="py-4 text-center text-caption text-muted-foreground-lighter"
                      >
                        {t("console.licensing.plans.features.empty")}
                      </TableCell>
                    </TableRow>
                  )}
                  {plan.features.map((feature) => featureRow(feature, false))}
                </TableBody>
              </Table>
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">
                {t("console.licensing.plans.features.overrides")}
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("console.licensing.plans.features.code")}
                    </TableHead>
                    <TableHead>
                      {t("console.licensing.plans.features.name")}
                    </TableHead>
                    <TableHead>
                      {t("console.licensing.plans.features.organization")}
                    </TableHead>
                    {canManage && (
                      <TableHead className="w-16 text-right">
                        {t("console.common.actions")}
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.overrides.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={canManage ? 4 : 3}
                        className="py-4 text-center text-caption text-muted-foreground-lighter"
                      >
                        {t("console.licensing.plans.features.empty")}
                      </TableCell>
                    </TableRow>
                  )}
                  {plan.overrides.map((feature) => featureRow(feature, true))}
                </TableBody>
              </Table>
            </section>

            {canManage && (
              <form onSubmit={submitFeature} className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold">
                  {t("console.licensing.plans.features.add")}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label={t("console.licensing.plans.features.code")}
                    value={featureCode}
                    onChange={(e) => setFeatureCode(e.target.value)}
                    required
                  />
                  <Input
                    label={t("console.licensing.plans.features.name")}
                    value={featureName}
                    onChange={(e) => setFeatureName(e.target.value)}
                    required
                  />
                  <Select
                    label={t("console.licensing.plans.features.organization")}
                    value={featureOrganization}
                    onChange={(e) => setFeatureOrganization(e.target.value)}
                    options={[
                      {
                        value: "",
                        label: t("console.licensing.plans.features.base"),
                      },
                      ...organizations.map((org) => ({
                        value: String(org.id),
                        label: org.name,
                      })),
                    ]}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="outlined"
                    shape="circle"
                    size="sm"
                    startIcon={<Plus />}
                    disabled={addFeature.isPending}
                  >
                    {t("console.licensing.plans.features.add")}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
