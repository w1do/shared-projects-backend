"use client";

import { useQuery } from "@tanstack/react-query";
import { getBootstrap } from "@/lib/admin/data-source/platform/auth";
import {
  PAY_PERMISSIONS,
  hasPayPermission,
} from "@/lib/admin/data-source/platform/pay-access";
import { getProjectKey } from "@/lib/admin/data-source/session";
import { adminQueryKeys } from "@/lib/admin/query/keys";

export type PayAccess = {
  canConfirmPayments: boolean;
  canRefundPayments: boolean;
  canManageSubscriptions: boolean;
  canManagePlans: boolean;
};

/** Права оператора в разделах оплаты — из bootstrap, одним вызовом на раздел. */
export function usePayAccessQuery() {
  return useQuery({
    queryKey: adminQueryKeys.pay.access(),
    queryFn: async (): Promise<PayAccess> => {
      const { permissions } = await getBootstrap(getProjectKey());

      return {
        canConfirmPayments: hasPayPermission(
          permissions,
          PAY_PERMISSIONS.paymentsConfirm,
        ),
        canRefundPayments: hasPayPermission(
          permissions,
          PAY_PERMISSIONS.paymentsRefund,
        ),
        canManageSubscriptions: hasPayPermission(
          permissions,
          PAY_PERMISSIONS.subscriptionsManage,
        ),
        canManagePlans: hasPayPermission(
          permissions,
          PAY_PERMISSIONS.plansManage,
        ),
      };
    },
  });
}
