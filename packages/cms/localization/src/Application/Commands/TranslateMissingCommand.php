<?php

declare(strict_types=1);

namespace Cms\Localization\Application\Commands;

/** Команда-намерение: перевести недостающие локали проекта. */
final readonly class TranslateMissingCommand
{
    public function __construct(
        /** @var list<string> локали проекта */
        public array $targetLocales,
        public string $defaultLocale,
        /** @var list<int>|null ограничить набор записей словаря; null — весь словарь */
        public ?array $ids = null,
        /** dictionary | categories | null — оба предмета */
        public ?string $subject = null,
    ) {}
}
