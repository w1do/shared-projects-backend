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
 * Идентификатор проекта для фабрики адаптеров захардкожен как '-': маршрут
 * `/webhooks/{provider}` идёт без auth и без `ProjectContext`, а
 * `ProviderRegistry::for()` свой `$projectId` игнорирует. Это известный
 * дефект из списка 9.2 — сохраняется дословно до его решения (Б7).
 */
final class ProviderWebhookGateway
{
    private const PROJECT_ID_PLACEHOLDER = '-';

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
        return $this->providers->for(self::PROJECT_ID_PLACEHOLDER, $provider);
    }
}
