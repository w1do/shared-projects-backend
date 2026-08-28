<?php

declare(strict_types=1);

namespace Cms\Localization\Domain\Contracts;

/** Чтение локализаций в рантайме (в скоупе текущего проекта). */
interface LocalizationReader
{
    /**
     * Значение по ключу и локали. Fallback: правка админа (`value`) →
     * синхронизированный `default_value` → значение из in-memory реестра.
     */
    public function get(string $service, string $key, string $locale): ?string;
}
