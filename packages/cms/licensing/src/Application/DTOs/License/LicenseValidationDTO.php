<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\DTOs\License;

use Cms\Licensing\Domain\Models\License;
use Spatie\LaravelData\Data;

/**
 * Ответ публичной валидации (Д6): для активной лицензии — статус, code плана,
 * коды фич из payload и срок; для любой невалидной — единый `invalid`
 * без причины и без PII организации.
 */
final class LicenseValidationDTO extends Data
{
    /** @param list<string>|null $features */
    public function __construct(
        public string $status,
        public ?string $plan = null,
        public ?array $features = null,
        public ?string $expires_at = null,
    ) {}

    public static function invalid(): self
    {
        return new self(status: 'invalid');
    }

    public static function fromActiveLicense(License $license): self
    {
        $payload = $license->payload();
        $features = $payload['features'] ?? [];

        return new self(
            status: 'active',
            plan: isset($payload['plan']) && is_string($payload['plan']) ? $payload['plan'] : null,
            features: is_array($features) ? array_values(array_map('strval', $features)) : [],
            expires_at: $license->expires_at->toIso8601String(),
        );
    }
}
