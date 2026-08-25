<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Bootstrap;

use Spatie\LaravelData\Data;

/**
 * Включённый сервис в bootstrap: версия, отфильтрованная по правам навигация
 * и схема настроек.
 *
 * `navigation` и `settings_schema` остаются массивами: их форму задаёт манифест
 * сервиса (`cms/contracts`), auth её не интерпретирует и не обязан знать.
 */
final class ServiceNavigationDTO extends Data
{
    /**
     * @param  list<array<string, mixed>>  $navigation
     * @param  list<array<string, mixed>>  $settings_schema
     */
    public function __construct(
        public string $key,
        public string $version,
        public bool $enabled,
        public array $navigation,
        public array $settings_schema,
    ) {}
}
