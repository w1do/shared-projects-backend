<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\SiteSettings;

use Spatie\LaravelData\Data;

/** Значения настроек сайта на запись. Валидация — в FormRequest, HTTP сюда не попадает. */
final class SiteSettingsDTO extends Data
{
    public function __construct(
        public string $project_type,
        public string $timezone,
        public string $language,
        public string $currency_default,
        /** @var list<string> */
        public array $currencies,
    ) {}

    /** @param array<string, mixed> $data провалидированные данные запроса */
    public static function fromValidated(array $data): self
    {
        /** @var array{project_type: string, timezone: string, language: string, currency_default: string, currencies: list<string>} $data */
        return new self(
            project_type: $data['project_type'],
            timezone: $data['timezone'],
            language: $data['language'],
            currency_default: $data['currency_default'],
            currencies: $data['currencies'],
        );
    }
}
