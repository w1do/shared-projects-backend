<?php

declare(strict_types=1);

namespace Cms\Pay\Infrastructure\Gateways;

use Cms\Pay\Domain\Contracts\PaymentProvider;
use Cms\Pay\Domain\Models\ProviderAccount;
use Illuminate\Validation\ValidationException;

/**
 * Фабрика провайдеров: адаптер получает пер-проектные креденшалы из
 * `provider_accounts` (encrypted) через `PaymentProvider::configure()`.
 * Проект без аккаунта — адаптер работает без конфига, как прежде.
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
    ];

    public function for(string $projectId, string $provider): PaymentProvider
    {
        $class = self::PROVIDERS[$provider] ?? null;
        if ($class === null) {
            throw ValidationException::withMessages(['provider' => ["Unknown payment provider [{$provider}]."]]);
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

        return $account === null ? $adapter : $adapter->configure($account->credentials ?? []);
    }

    /** @return list<string> */
    public static function available(): array
    {
        return array_keys(self::PROVIDERS);
    }
}
