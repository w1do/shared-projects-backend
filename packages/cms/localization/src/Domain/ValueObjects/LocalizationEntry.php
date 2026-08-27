<?php

declare(strict_types=1);

namespace Cms\Localization\Domain\ValueObjects;

/** Зарегистрированный ключ локализации: принадлежность, локаль и значение по умолчанию. */
final readonly class LocalizationEntry
{
    public function __construct(
        public string $service,
        public string $key,
        public string $locale,
        public string $value,
    ) {}
}
