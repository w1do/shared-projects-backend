"use client";

import * as React from "react";
import { Archive, Pencil, Plus } from "lucide-react";
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
import { PageHeader } from "@/components/shared/layout/PageHeader";
import {
  useArchivePayPlanMutation,
  useCreatePayPlanMutation,
  usePayAccessQuery,
  usePayPlans,
  useUpdatePayPlanMutation,
} from "@/hooks/admin/pay";
import { formatMinor } from "@/lib/admin/money";
import type { PayInterval, PlatformPayPlan } from "@/lib/admin/services/pay";
import { useConsoleText } from "@/lib/admin/use-console-text";

const INTERVALS: PayInterval[] = ["day", "month", "year"];

/** Тарифные планы подписок проекта: планы лицензий живут в своём разделе. */
export default function PlansPage() {
  const t = useConsoleText();
  const { items, isPending, hasNextPage, isFetchingNextPage, fetchNextPage } =
    usePayPlans();
  const { data: access } = usePayAccessQuery();
  const archiveMutation = useArchivePayPlanMutation();
  const [formTarget, setFormTarget] = React.useState<
    PlatformPayPlan | "new" | null
  >(null);

  const canManage = access?.canManagePlans ?? false;

  return (
    <div className="flex flex-col gap-8" data-testid="plans-page">
      <PageHeader
        title={t("console.nav.plans")}
        description={t("console.plans.description")}
        breadcrumbItems={[
          { label: t("console.common.breadcrumb-admin"), href: "/admin" },
          { label: t("console.nav.group.payments"), href: "/admin/payments" },
          { label: t("console.nav.plans") },
        ]}
        actions={
          canManage && (
            <Button
              type="button"
              variant="contained"
              color="primary"
              shape="circle"
              size="sm"
              startIcon={<Plus />}
              onClick={() => setFormTarget("new")}
              data-testid="plan-create-open"
            >
              {t("console.plans.add")}
            </Button>
          )
        }
      />

      <Table data-testid="plans-table">
        <TableHeader>
          <TableRow>
            <TableHead>{t("console.plans.table.code")}</TableHead>
            <TableHead>{t("console.plans.table.name")}</TableHead>
            <TableHead>{t("console.plans.table.price")}</TableHead>
            <TableHead>{t("console.plans.table.interval")}</TableHead>
            <TableHead>{t("console.plans.table.state")}</TableHead>
            <TableHead className="w-24 text-right">
              {t("console.common.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isPending && items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-8 text-center text-caption text-muted-foreground-lighter"
              >
                {t("console.plans.empty")}
              </TableCell>
            </TableRow>
          )}
          {items.map((plan) => (
            <TableRow key={plan.id} data-plan={plan.code}>
              <TableCell className="font-mono text-xs">{plan.code}</TableCell>
              <TableCell className="font-medium">{plan.name}</TableCell>
              <TableCell>
                {formatMinor(plan.price_minor, plan.currency)}
              </TableCell>
              <TableCell>
                {t(`console.plans.interval.${plan.interval}`)}
              </TableCell>
              <TableCell>
                <Badge
                  color={plan.archived ? "secondary" : "success"}
                  variant="soft"
                  shape="circle"
                >
                  {plan.archived
                    ? t("console.plans.state.archived")
                    : t("console.plans.state.active")}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {canManage && (
                    <IconButton
                      aria-label={t("console.common.edit")}
                      size="sm"
                      variant="ghost"
                      onClick={() => setFormTarget(plan)}
                      data-testid="plan-edit"
                    >
                      <Pencil />
                    </IconButton>
                  )}
                  {canManage && !plan.archived && (
                    <IconButton
                      aria-label={t("console.plans.archive")}
                      size="sm"
                      variant="ghost"
                      disabled={archiveMutation.isPending}
                      onClick={() => archiveMutation.mutate(plan.id)}
                      data-testid="plan-archive"
                    >
                      <Archive />
                    </IconButton>
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
            {t("console.plans.load-more")}
          </Button>
        </div>
      )}

      <PlanFormDialog target={formTarget} onClose={() => setFormTarget(null)} />
    </div>
  );
}

/** Форма плана: цена вводится в минорных единицах, как её хранит платформа. */
function PlanFormDialog({
  target,
  onClose,
}: {
  target: PlatformPayPlan | "new" | null;
  onClose: () => void;
}) {
  const t = useConsoleText();
  const createMutation = useCreatePayPlanMutation();
  const updateMutation = useUpdatePayPlanMutation();

  const editing = target === "new" || target === null ? null : target;

  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [priceMinor, setPriceMinor] = React.useState("");
  const [currency, setCurrency] = React.useState("RUB");
  const [interval, setInterval] = React.useState<PayInterval>("month");

  React.useEffect(() => {
    setCode(editing?.code ?? "");
    setName(editing?.name ?? "");
    setPriceMinor(editing?.price_minor?.toString() ?? "");
    setCurrency(editing?.currency ?? "RUB");
    setInterval(editing?.interval ?? "month");
  }, [editing]);

  if (target === null) return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const input = {
      code,
      name,
      price_minor: Number(priceMinor),
      currency,
      interval,
    };

    const done = { onSuccess: onClose };

    editing === null
      ? createMutation.mutate(input, done)
      : updateMutation.mutate({ id: editing.id, input }, done);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing === null
              ? t("console.plans.form.create-title")
              : t("console.plans.form.edit-title")}
          </DialogTitle>
          <DialogDescription>{t("console.plans.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="mt-2 flex flex-col gap-4">
          <Input
            label={t("console.plans.form.code")}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <Input
            label={t("console.plans.form.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label={t("console.plans.form.price-minor")}
            value={priceMinor}
            inputMode="numeric"
            onChange={(e) => setPriceMinor(e.target.value)}
            required
          />
          <Input
            label={t("console.plans.form.currency")}
            value={currency}
            maxLength={3}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            required
          />
          <Select
            label={t("console.plans.form.interval")}
            value={interval}
            onChange={(e) => setInterval(e.target.value as PayInterval)}
            options={INTERVALS.map((value) => ({
              value,
              label: t(`console.plans.interval.${value}`),
            }))}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outlined" shape="circle" onClick={onClose}>
              {t("console.common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              shape="circle"
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="plan-submit"
            >
              {t("console.common.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
