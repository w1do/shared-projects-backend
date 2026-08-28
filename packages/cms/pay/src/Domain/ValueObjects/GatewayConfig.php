<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\ValueObjects;

use Cms\Pay\Domain\Models\ProviderAccount;

/**
 * Типизированные настройки шлюза для `PaymentProvider::configure()` (Д4):
 * секреты отдельно от URL-ов возврата и произвольных properties —
 * адаптер не знает про Eloquent и persistence-жизненный цикл.
 */
final readonly class GatewayConfig
{
    /**
     * @param  array<string, mixed>  $credentials
     * @param  array<string, mixed>  $properties
     */
    public function __construct(
        public array $credentials = [],
        public ?string $returnUrl = null,
        public ?string $failUrl = null,
        public array $properties = [],
    ) {}

    public static function empty(): self
    {
        return new self;
    }

    public static function fromAccount(ProviderAccount $account): self
    {
        return new self(
            credentials: $account->credentials ?? [],
            returnUrl: $account->return_url,
            failUrl: $account->fail_url,
            properties: $account->properties ?? [],
        );
    }

    public function hasCredentials(): bool
    {
        return $this->credentials !== [];
    }

    /** Скалярный credential строкой — удобство адаптеров (ключи API, секреты). */
    public function credential(string $key): ?string
    {
        $value = $this->credentials[$key] ?? null;

        return is_scalar($value) ? (string) $value : null;
    }
}
