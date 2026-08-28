<?php

declare(strict_types=1);

namespace Cms\Pay\Application\DTOs\Settings;

use Cms\Pay\Domain\Settings\PaymentsSettings;
use Spatie\LaravelData\Data;

/** Чистая структура между слоями: валидация — в FormRequest, HTTP сюда не попадает. */
final class PaymentsSettingsDTO extends Data
{
    public function __construct(public string $provider) {}

    public static function fromSettings(PaymentsSettings $settings): self
    {
        return new self(provider: $settings->provider);
    }

    /** @param array<string, mixed> $data провалидированные данные запроса */
    public static function fromValidated(array $data): self
    {
        /** @var array{provider: string} $data */
        return new self(provider: $data['provider']);
    }
}
