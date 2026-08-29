<?php

declare(strict_types=1);

namespace Cms\Research\Domain\Enums;

/** Жизненный цикл темы поста. */
enum TopicStatus: string
{
    case Suggested = 'suggested';
    case Used = 'used';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Suggested => 'Предложена',
            self::Used => 'Использована',
            self::Rejected => 'Отклонена',
        };
    }

    /** Писать пост можно только по предложенной теме. */
    public function canTransitionTo(self $target): bool
    {
        return match ($this) {
            self::Suggested => $target !== self::Suggested,
            self::Used, self::Rejected => false,
        };
    }
}
