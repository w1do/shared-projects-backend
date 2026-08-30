<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\SiteSettings;

use Cms\Auth\Domain\Enums\ProjectType;
use Cms\Auth\Domain\Settings\SiteSettings;
use Spatie\LaravelData\Data;

/** Настройки сайта на выдачу: значения проекта вместе с допустимыми вариантами. */
final class SiteSettingsViewDTO extends Data
{
    public function __construct(
        public string $project_type,
        public string $timezone,
        public string $language,
        public string $currency_default,
        /** @var list<string> */
        public array $currencies,
        public SiteSettingsOptionsDTO $options,
    ) {}

    /** @param list<string> $locales локали проекта */
    public static function fromSettings(SiteSettings $settings, array $locales): self
    {
        return new self(
            project_type: $settings->project_type,
            timezone: $settings->timezone,
            language: $settings->language,
            currency_default: $settings->currency_default,
            currencies: $settings->currencies,
            options: new SiteSettingsOptionsDTO(
                project_types: ProjectType::values(),
                timezones: SiteSettings::timezones(),
                currencies: SiteSettings::currencyCodes(),
                locales: $locales,
            ),
        );
    }
}
