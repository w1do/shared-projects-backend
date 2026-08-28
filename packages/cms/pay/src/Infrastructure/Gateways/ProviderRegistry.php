<?php

declare(strict_types=1);

namespace Cms\Pay\Infrastructure\Gateways;

use Cms\Pay\Application\Exceptions\ProviderNotConfigured;
use Cms\Pay\Application\Exceptions\UnknownPaymentProvider;
use Cms\Pay\Domain\Contracts\PaymentProvider;
use Cms\Pay\Domain\Models\ProviderAccount;
use Cms\Pay\Domain\ValueObjects\GatewayConfig;

/**
 * Фабрика провайдеров: адаптер получает пер-проектные настройки из
 * `provider_accounts` (encrypted) типизированным `GatewayConfig` через
 * `PaymentProvider::configure()` (Д4). Архивная запись настроек —
 * доменная ошибка «провайдер не настроен/неактивен»; проект без
 * записи — адаптер работает без конфига, как прежде.
 */
final class ProviderRegistry
{
    /**
     * Плейсхолдер verify-фазы вебхука: маршрут `/webhooks/{provider}` идёт
     * без auth и без `ProjectContext`, проект известен только после резолва
     * платежа из payload — конфиг проекта на этой фазе не применяется.
     */
    public const WITHOUT_PROJECT = '-';

    /** @var array<string, class-string<PaymentProvider>> */
    private const PROVIDERS = [
        'manual' => ManualProvider::class,
        'null' => NullProvider::class,
        'platega' => PlategaProvider::class,
    ];

    public function for(string $projectId, string $provider): PaymentProvider
    {
        $class = self::PROVIDERS[$provider] ?? null;
        if ($class === null) {
            throw UnknownPaymentProvider::make($provider);
        }

        $adapter = app($class);

        if ($projectId === self::WITHOUT_PROJECT) {
            return $adapter;
        }

        // acrossProjects: фабрика вызывается и из джоб без tenant-контекста,
        // проект задан явным аргументом.
        $account = ProviderAccount::acrossProjects()
            ->where('project_id', $projectId)
            ->where('provider', $provider)
            ->first();

        if ($account === null) {
            return $adapter;
        }

        if (! $account->status->isActive()) {
            throw ProviderNotConfigured::make($provider);
        }

        return $adapter->configure(GatewayConfig::fromAccount($account));
    }

    /** @return list<string> */
    public static function available(): array
    {
        return array_keys(self::PROVIDERS);
    }
}
