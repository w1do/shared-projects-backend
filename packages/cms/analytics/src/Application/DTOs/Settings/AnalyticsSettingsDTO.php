<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\DTOs\Settings;

use Cms\Analytics\Domain\Settings\AnalyticsSettings;
use Spatie\LaravelData\Data;

/** Чистая структура между слоями: валидация — в FormRequest, HTTP сюда не попадает. */
final class AnalyticsSettingsDTO extends Data
{
    public function __construct(
        public bool $yandex_enabled,
        public ?string $yandex_id,
        public bool $google_enabled,
        public ?string $google_id,
    ) {}

    public static function fromSettings(AnalyticsSettings $settings): self
    {
        return new self(
            yandex_enabled: $settings->yandex_enabled,
            yandex_id: $settings->yandex_id,
            google_enabled: $settings->google_enabled,
            google_id: $settings->google_id,
        );
    }

    /** @param array<string, mixed> $data провалидированные данные запроса */
    public static function fromValidated(array $data): self
    {
        /** @var array{yandex_enabled: bool, yandex_id?: string|null, google_enabled: bool, google_id?: string|null} $data */
        return new self(
            yandex_enabled: $data['yandex_enabled'],
            yandex_id: $data['yandex_id'] ?? null,
            google_enabled: $data['google_enabled'],
            google_id: $data['google_id'] ?? null,
        );
    }
}
