<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\SiteSettings;

use Cms\Auth\Domain\Settings\SiteSettings;
use Spatie\LaravelData\Data;

/** Чистая структура между слоями: валидация — в FormRequest, HTTP сюда не попадает. */
final class SiteSettingsDTO extends Data
{
    public function __construct(
        public string $language,
        public string $currency_default,
        /** @var list<string> */
        public array $currencies,
    ) {}

    public static function fromSettings(SiteSettings $settings): self
    {
        return new self(
            language: $settings->language,
            currency_default: $settings->currency_default,
            currencies: $settings->currencies,
        );
    }

    /** @param array<string, mixed> $data провалидированные данные запроса */
    public static function fromValidated(array $data): self
    {
        /** @var array{language: string, currency_default: string, currencies: list<string>} $data */
        return new self(
            language: $data['language'],
            currency_default: $data['currency_default'],
            currencies: $data['currencies'],
        );
    }
}
