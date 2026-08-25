<?php

declare(strict_types=1);

namespace Cms\Pay\Infrastructure\Providers;

use Cms\Pay\Domain\Contracts\PaymentProvider;
use Illuminate\Validation\ValidationException;

/** Фабрика провайдеров: конфиг на проект, секреты — в provider_accounts (encrypted). */
final class ProviderRegistry
{
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

        return app($class);
    }

    /** @return list<string> */
    public static function available(): array
    {
        return array_keys(self::PROVIDERS);
    }
}
