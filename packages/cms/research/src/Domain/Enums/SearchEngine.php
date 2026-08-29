<?php

declare(strict_types=1);

namespace Cms\Research\Domain\Enums;

/** Поисковая система запроса к SerpApi-совместимой службе. */
enum SearchEngine: string
{
    case Yandex = 'yandex';
    case Google = 'google';

    /**
     * Имя параметра запроса: Yandex ждёт `text`, Google — `q`.
     */
    public function queryParam(): string
    {
        return match ($this) {
            self::Yandex => 'text',
            self::Google => 'q',
        };
    }

    /** @return list<string> */
    public static function values(): array
    {
        return array_map(static fn (self $case): string => $case->value, self::cases());
    }
}
