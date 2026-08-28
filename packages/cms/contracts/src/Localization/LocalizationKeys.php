<?php

declare(strict_types=1);

namespace Cms\Contracts\Localization;

/**
 * Контракт реестра ключей локализации сервиса.
 *
 * Реализуется string-backed enum-ом: значение case — ключ локализации,
 * `entries()` — карта «ключ → значение по умолчанию». Enum-ы живут в
 * cms/contracts, потому что у каждого сервиса своя БД: content-service
 * собирает ключи всех сервисов в единый реестр (см. design изменения
 * localization-registry-and-settings-analytics-pay-config).
 */
interface LocalizationKeys
{
    /** Ключ сервиса-владельца (content|pay|analytics). */
    public static function service(): string;

    /** Локаль значений по умолчанию. */
    public static function locale(): string;

    /** @return array<string, string> ключ → значение по умолчанию */
    public static function entries(): array;
}
