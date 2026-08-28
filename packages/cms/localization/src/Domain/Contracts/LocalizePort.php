<?php

declare(strict_types=1);

namespace Cms\Localization\Domain\Contracts;

use Cms\Localization\Domain\ValueObjects\LocalizationEntry;

/**
 * Порт реестра локализаций: сервисы объявляют ключи и значения по умолчанию
 * на этапе загрузки, `localize:sync` выравнивает реестр с таблицей `localization`.
 */
interface LocalizePort
{
    /** @param array<string, string> $entries ключ → значение по умолчанию */
    public function register(string $service, string $locale, array $entries): void;

    /** @return list<LocalizationEntry> */
    public function all(): array;

    /** Значение по умолчанию из реестра (без обращения к БД). */
    public function defaultValue(string $service, string $key, string $locale): ?string;
}
