<?php

declare(strict_types=1);

namespace Cms\Localization\Application\Commands;

/** Команда-намерение: дозаполнить недостающие локали словаря проекта. */
final readonly class TranslateDictionaryCommand
{
    public function __construct(
        /** @var list<string> локали проекта */
        public array $targetLocales,
        public string $defaultLocale,
        /** @var list<int>|null ограничить набор записей; null — весь словарь */
        public ?array $ids = null,
    ) {}
}
