"use client";

import * as React from "react";
import { Pause, Play, Trash2, XCircle } from "lucide-react";
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
import { Select } from "@/components/ui/inputs/select";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import {
  useChangeSubscriptionMutation,
  usePayAccessQuery,
  useSubscriptions,
} from "@/hooks/admin/pay";
import type { SubscriptionAction } from "@/lib/admin/services/pay";
import { useConsoleText } from "@/lib/admin/use-console-text";

/** Морф-алиасы предметов подписки: план подписок pay и план лицензий. */
const SUBJECT_TYPES = ["plan", "license_plan"] as const;

const ACTIONS: { action: SubscriptionAction; icon: typeof Pause }[] = [
  { action: "pause", icon: Pause },
  { action: "resume", icon: Play },
  { action: "cancel", icon: XCircle },
  { action: "delete", icon: Trash2 },
];

/** Подписки проекта: отбор по типу предмета и действия оператора. */
export default function SubscriptionsPage() {
  const t = useConsoleText();
  const [subjectType, setSubjectType] = React.useState<string | undefined>();
  const { items, isPending, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSubscriptions(subjectType);
  const { data: access } = usePayAccessQuery();
  const changeMutation = useChangeSubscriptionMutation();

  const subjectLabel = (type: string) =>
    type === "license_plan"
      ? t("console.subscriptions.subject.license-plan")
      : t("console.subscriptions.subject.plan");

  return (
    <div className="flex flex-col gap-8" data-testid="subscriptions-page">
      <PageHeader
        title={t("console.nav.subscriptions")}
        description={t("console.subscriptions.description")}
        breadcrumbItems={[
          { label: t("console.common.breadcrumb-admin"), href: "/admin" },
          { label: t("console.nav.group.payments"), href: "/admin/payments" },
          { label: t("console.nav.subscriptions") },
        ]}
      />

      <div className="max-w-xs">
        <Select
          label={t("console.subscriptions.filter.subject")}
          value={subjectType ?? ""}
          onChange={(e) =>
            setSubjectType(e.target.value === "" ? undefined : e.target.value)
          }
          options={[
            { value: "", label: t("console.subscriptions.filter.all") },
            ...SUBJECT_TYPES.map((type) => ({
              value: type,
              label: subjectLabel(type),
            })),
          ]}
          data-testid="subscriptions-filter-subject"
        />
      </div>

      <Table data-testid="subscriptions-table">
        <TableHeader>
          <TableRow>
            <TableHead>{t("console.subscriptions.table.subscriber")}</TableHead>
            <TableHead>{t("console.subscriptions.table.subject")}</TableHead>
            <TableHead>{t("console.subscriptions.table.subject-type")}</TableHead>
            <TableHead>{t("console.subscriptions.table.status")}</TableHead>
            <TableHead>{t("console.subscriptions.table.period-ends")}</TableHead>
            <TableHead className="w-36 text-right">
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
                {t("console.subscriptions.empty")}
              </TableCell>
            </TableRow>
          )}
          {items.map((subscription) => (
            <TableRow key={subscription.id} data-subscription={subscription.id}>
              <TableCell className="font-mono text-xs">
                {subscription.subscriber.type} · {subscription.subscriber.id}
              </TableCell>
              <TableCell className="font-medium">
                {subscription.subject?.name ?? "—"}
              </TableCell>
              <TableCell>
                {subscription.subject === null
                  ? "—"
                  : subjectLabel(subscription.subject.type)}
              </TableCell>
              <TableCell>
                <Badge
                  color={subscription.grants_access ? "success" : "secondary"}
                  variant="soft"
                  shape="circle"
                >
                  {subscription.status}
                </Badge>
              </TableCell>
              <TableCell>
                {formatDate(subscription.current_period_ends_at)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {access?.canManageSubscriptions &&
                    ACTIONS.map(({ action, icon: Icon }) => (
                      <IconButton
                        key={action}
                        aria-label={t(
                          `console.subscriptions.action.${action}` as const,
                        )}
                        size="sm"
                        variant="ghost"
                        disabled={changeMutation.isPending}
                        onClick={() =>
                          changeMutation.mutate({ id: subscription.id, action })
                        }
                        data-testid={`subscription-${action}`}
                      >
                        <Icon />
                      </IconButton>
                    ))}
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
            {t("console.subscriptions.load-more")}
          </Button>
        </div>
      )}
    </div>
  );
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString("ru-RU") : "—";
}
