<?php

declare(strict_types=1);

namespace Cms\Localization\Application\Commands;

/** Команда-намерение: дозаполнить недостающие локали предметов чужих пакетов. */
final readonly class TranslateSubjectsCommand
{
    public function __construct(
        /** @var list<string> локали проекта */
        public array $targetLocales,
        public string $defaultLocale,
        /** Имя предмета; null — все зарегистрированные. */
        public ?string $subject = null,
    ) {}
}
