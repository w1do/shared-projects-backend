<?php

declare(strict_types=1);

namespace Cms\Research\Domain\Enums;

/** Поисковая система запроса к SerpApi-совместимой службе. */
enum SearchEngine: string
{
    case Yandex = 'yandex';
    case Google = 'google';
    case YandexImages = 'yandex_images';
    case GoogleImages = 'google_images';

    /**
     * Имя параметра запроса: Yandex ждёт `text`, Google — `q`.
     */
    public function queryParam(): string
    {
        return match ($this) {
            self::Yandex, self::YandexImages => 'text',
            self::Google, self::GoogleImages => 'q',
        };
    }

    /** Движок ищет картинки, а не веб-страницы. */
    public function isImages(): bool
    {
        return $this === self::YandexImages || $this === self::GoogleImages;
    }

    /** @return list<string> */
    public static function values(): array
    {
        return array_map(static fn (self $case): string => $case->value, self::cases());
    }

    /** Движки веб-поиска: ресёрч разбирает органическую выдачу и картинками не питается. */
    public static function webSearchValues(): array
    {
        return array_values(array_map(
            static fn (self $case): string => $case->value,
            array_filter(self::cases(), static fn (self $case): bool => ! $case->isImages()),
        ));
    }
}
