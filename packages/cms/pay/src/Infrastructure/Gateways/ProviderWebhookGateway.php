<?php

declare(strict_types=1);

namespace Cms\Pay\Infrastructure\Gateways;

use Cms\Pay\Domain\Contracts\PaymentProvider;
use Illuminate\Http\Request;

/**
 * Приём вебхука на стороне адаптера провайдера: известен ли провайдер,
 * верна ли подпись, что лежит в теле. Бизнес-логики здесь нет — только
 * разговор с внешним миром, поэтому класс живёт в Infrastructure, а не в
 * Application (порт `PaymentProvider` работает с `Request`).
 *
 * Verify-фаза идёт с `ProviderRegistry::WITHOUT_PROJECT`: маршрут
 * `/webhooks/{provider}` без auth и без `ProjectContext`, проект известен
 * только после резолва платежа из payload — пер-проектный конфиг адаптера
 * на этой фазе сознательно не применяется.
 */
final class ProviderWebhookGateway
{
    public function __construct(private readonly ProviderRegistry $providers) {}

    public function supports(string $provider): bool
    {
        return in_array($provider, ProviderRegistry::available(), true);
    }

    public function verifySignature(string $provider, Request $request): bool
    {
        return $this->adapter($provider)->verifyWebhook($request);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{external_id: string, status: string, payment_id: ?string}
     */
    public function parse(string $provider, array $payload): array
    {
        return $this->adapter($provider)->parseWebhook($payload);
    }

    private function adapter(string $provider): PaymentProvider
    {
        return $this->providers->for(ProviderRegistry::WITHOUT_PROJECT, $provider);
    }
}
