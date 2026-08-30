<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\SiteSettings;

use Spatie\LaravelData\Data;

/** Допустимые значения настроек сайта: консоль выбирает из них, а не вводит текстом. */
final class SiteSettingsOptionsDTO extends Data
{
    /**
     * @param  list<string>  $project_types
     * @param  list<string>  $timezones
     * @param  list<string>  $currencies
     * @param  list<string>  $locales
     */
    public function __construct(
        public array $project_types,
        public array $timezones,
        public array $currencies,
        public array $locales,
    ) {}
}
