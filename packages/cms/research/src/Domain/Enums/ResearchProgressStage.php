<?php

declare(strict_types=1);

namespace Cms\Research\Domain\Enums;

/** Этап работы исследования: показывается оператору, пока идёт сбор. */
enum ResearchProgressStage: string
{
    case Starting = 'starting';
    case Searching = 'searching';
    case Writing = 'writing';
    case Completed = 'completed';

    public function label(): string
    {
        return match ($this) {
            self::Starting => 'Подготовка',
            self::Searching => 'Поиск источников',
            self::Writing => 'Сборка текста',
            self::Completed => 'Готово',
        };
    }
}
