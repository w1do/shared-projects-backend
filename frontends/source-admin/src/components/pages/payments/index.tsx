"use client";

import * as React from "react";
import { Check, Undo2 } from "lucide-react";
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
  useConfirmPaymentMutation,
  usePayAccessQuery,
  usePayments,
  useRefundPaymentMutation,
} from "@/hooks/admin/pay";
import { formatMinor, majorToMinor } from "@/lib/admin/money";
import type {
  PaymentStatusFilter,
  PlatformPayment,
} from "@/lib/admin/services/pay";
import { useConsoleText } from "@/lib/admin/use-console-text";

const STATUS_BADGE: Record<
  PaymentStatusFilter,
  "success" | "error" | "warning" | "secondary"
> = {
  created: "secondary",
  pending: "warning",
  succeeded: "success",
  failed: "error",
  canceled: "secondary",
  refunded_partial: "warning",
  refunded_full: "error",
};

const CONFIRMABLE: PaymentStatusFilter[] = ["created", "pending"];
const REFUNDABLE: PaymentStatusFilter[] = ["succeeded", "refunded_partial"];

/** Транзакции оплат проекта: список, подтверждение счёта и возврат. */
export default function PaymentsPage() {
  const t = useConsoleText();
  const [status, setStatus] = React.useState<PaymentStatusFilter | undefined>();
  const { items, isPending, hasNextPage, isFetchingNextPage, fetchNextPage } =
    usePayments(status);
  const { data: access } = usePayAccessQuery();
  const confirmMutation = useConfirmPaymentMutation();
  const [refundTarget, setRefundTarget] = React.useState<PlatformPayment | null>(
    null,
  );

  const statusLabel = (value: PaymentStatusFilter) =>
    t(`console.payments.status.${value}` as const);

  return (
    <div className="flex flex-col gap-8" data-testid="payments-page">
      <PageHeader
        title={t("console.nav.payments")}
        description={t("console.payments.description")}
        breadcrumbItems={[
          { label: t("console.common.breadcrumb-admin"), href: "/admin" },
          { label: t("console.nav.group.payments"), href: "/admin/payments" },
          { label: t("console.nav.payments") },
        ]}
      />

      <div className="max-w-xs">
        <Select
          label={t("console.payments.filter.status")}
          value={status ?? ""}
          onChange={(e) =>
            setStatus(
              e.target.value === ""
                ? undefined
                : (e.target.value as PaymentStatusFilter),
            )
          }
          options={[
            { value: "", label: t("console.payments.filter.all") },
            ...Object.keys(STATUS_BADGE).map((value) => ({
              value,
              label: statusLabel(value as PaymentStatusFilter),
            })),
          ]}
          data-testid="payments-filter-status"
        />
      </div>

      <Table data-testid="payments-table">
        <TableHeader>
          <TableRow>
            <TableHead>{t("console.payments.table.payer")}</TableHead>
            <TableHead>{t("console.payments.table.amount")}</TableHead>
            <TableHead>{t("console.payments.table.refunded")}</TableHead>
            <TableHead>{t("console.payments.table.status")}</TableHead>
            <TableHead>{t("console.payments.table.provider")}</TableHead>
            <TableHead>{t("console.payments.table.created")}</TableHead>
            <TableHead className="w-24 text-right">
              {t("console.common.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isPending && items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-8 text-center text-caption text-muted-foreground-lighter"
              >
                {t("console.payments.empty")}
              </TableCell>
            </TableRow>
          )}
          {items.map((payment) => (
            <TableRow key={payment.id} data-payment={payment.id}>
              <TableCell className="font-mono text-xs">
                {payment.subject_key}
              </TableCell>
              <TableCell className="font-medium">
                {formatMinor(payment.amount_minor, payment.currency)}
              </TableCell>
              <TableCell>
                {payment.refunded_minor > 0
                  ? formatMinor(payment.refunded_minor, payment.currency)
                  : "—"}
              </TableCell>
              <TableCell>
                <Badge
                  color={STATUS_BADGE[payment.status]}
                  variant="soft"
                  shape="circle"
                >
                  {statusLabel(payment.status)}
                </Badge>
              </TableCell>
              <TableCell>{payment.provider}</TableCell>
              <TableCell>{formatDateTime(payment.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {access?.canConfirmPayments &&
                    CONFIRMABLE.includes(payment.status) && (
                      <IconButton
                        aria-label={t("console.payments.confirm")}
                        size="sm"
                        variant="ghost"
                        disabled={confirmMutation.isPending}
                        onClick={() => confirmMutation.mutate(payment.id)}
                        data-testid="payment-confirm"
                      >
                        <Check />
                      </IconButton>
                    )}
                  {access?.canRefundPayments &&
                    REFUNDABLE.includes(payment.status) && (
                      <IconButton
                        aria-label={t("console.payments.refund")}
                        size="sm"
                        variant="ghost"
                        onClick={() => setRefundTarget(payment)}
                        data-testid="payment-refund"
                      >
                        <Undo2 />
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
            {t("console.payments.load-more")}
          </Button>
        </div>
      )}

      <RefundDialog
        target={refundTarget}
        onClose={() => setRefundTarget(null)}
      />
    </div>
  );
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString("ru-RU") : "—";
}

/** Возврат: пустая сумма означает полный возврат, а не нулевой. */
function RefundDialog({
  target,
  onClose,
}: {
  target: PlatformPayment | null;
  onClose: () => void;
}) {
  const t = useConsoleText();
  const refundMutation = useRefundPaymentMutation();
  const [amount, setAmount] = React.useState("");

  React.useEffect(() => setAmount(""), [target]);

  if (target === null) return null;

  const submit = () => {
    const trimmed = amount.trim();

    refundMutation.mutate(
      {
        id: target.id,
        input:
          trimmed === ""
            ? {}
            : { amount_minor: majorToMinor(Number(trimmed), target.currency) },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("console.payments.refund")}</DialogTitle>
          <DialogDescription>
            {t("console.payments.refund-hint")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-4">
          <Input
            label={t("console.payments.refund-amount")}
            value={amount}
            inputMode="decimal"
            onChange={(e) => setAmount(e.target.value)}
            data-testid="payment-refund-amount"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outlined" shape="circle" onClick={onClose}>
              {t("console.common.cancel")}
            </Button>
            <Button
              type="button"
              variant="contained"
              color="primary"
              shape="circle"
              disabled={refundMutation.isPending}
              onClick={submit}
              data-testid="payment-refund-submit"
            >
              {t("console.payments.refund")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
