<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Listeners;

use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\Models\ProviderAccount;

/**
 * Общие props событий жизненного цикла платежа (Д8): провайдер, план
 * («что получил»), подписка; при неуспехе — код/сообщение ошибки провайдера
 * из `last_error` настроек (включается только для этого же payment_id).
 */
final class PaymentAnalyticsProps
{
    /** @return array<string, mixed> */
    public static function for(Payment $payment, bool $withError = false): array
    {
        $plan = $payment->subscription_id === null ? null : $payment->subscription?->plan;

        $props = [
            'payment_id' => $payment->id,
            'provider' => $payment->provider,
            'plan_id' => $plan?->id,
            'plan_name' => $plan?->name,
            'subscription_id' => $payment->subscription_id,
        ];

        if ($withError) {
            $error = self::lastError($payment);
            if ($error !== null) {
                $props['error'] = $error;
            }
        }

        return $props;
    }

    /** @return array{code: string, message: string}|null */
    private static function lastError(Payment $payment): ?array
    {
        // acrossProjects + явный project_id: listener работает и в вебхук-джобе
        $account = ProviderAccount::acrossProjects()
            ->where('project_id', $payment->project_id)
            ->where('provider', $payment->provider)
            ->first();

        $lastError = $account?->properties['last_error'] ?? null;
        if (! is_array($lastError) || ($lastError['payment_id'] ?? null) !== $payment->id) {
            return null;
        }

        return [
            'code' => (string) ($lastError['code'] ?? ''),
            'message' => (string) ($lastError['message'] ?? ''),
        ];
    }
}
