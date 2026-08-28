<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Listeners;

use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\Models\ProviderAccount;
use Cms\Shared\Billing\Subscribable;

/**
 * Общие props событий жизненного цикла платежа (Д8): провайдер, предмет
 * подписки («что получил»), подписка; при неуспехе — код/сообщение ошибки
 * провайдера из `last_error` настроек (только для этого же payment_id).
 * Ключи `plan_id`/`plan_name` сохраняются ради непрерывности отчётов (Д11);
 * значениями теперь служат id/имя полиморфного предмета.
 */
final class PaymentAnalyticsProps
{
    /** @return array<string, mixed> */
    public static function for(Payment $payment, bool $withError = false): array
    {
        $subject = $payment->subscription_id === null ? null : $payment->subscription?->subject;

        $props = [
            'payment_id' => $payment->id,
            'provider' => $payment->provider,
            'plan_id' => $subject?->getKey(),
            'plan_name' => $subject instanceof Subscribable ? $subject->subscriptionName() : null,
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
