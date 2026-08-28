<?php

declare(strict_types=1);

namespace Cms\Localization\Infrastructure\Persistence;

use Cms\Localization\Domain\Contracts\LocalizePort;
use Cms\Localization\Domain\ValueObjects\LocalizationEntry;

/**
 * In-memory реестр локализаций. Наполняется в register() провайдера из
 * enum-реестров `cms-localization.registries`; повторная регистрация ключа
 * перезаписывает значение (идемпотентность загрузки).
 */
final class LocalizeRegistry implements LocalizePort
{
    /** @var array<string, LocalizationEntry> "service|key|locale" → запись */
    private array $entries = [];

    public function register(string $service, string $locale, array $entries): void
    {
        foreach ($entries as $key => $value) {
            $this->entries["{$service}|{$key}|{$locale}"] = new LocalizationEntry($service, $key, $locale, $value);
        }
    }

    public function all(): array
    {
        return array_values($this->entries);
    }

    public function defaultValue(string $service, string $key, string $locale): ?string
    {
        return ($this->entries["{$service}|{$key}|{$locale}"] ?? null)?->value;
    }
}
