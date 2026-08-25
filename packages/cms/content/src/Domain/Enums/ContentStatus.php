<?php

declare(strict_types=1);

namespace Cms\Content\Domain\Enums;

/** Статус-машина контента. Переходы — только через canTransitionTo. */
enum ContentStatus: string
{
    case Draft = 'draft';
    case Scheduled = 'scheduled';
    case Published = 'published';
    case Archived = 'archived';

    public function canTransitionTo(self $target): bool
    {
        return match ($this) {
            self::Draft => in_array($target, [self::Scheduled, self::Published], true),
            self::Scheduled => in_array($target, [self::Draft, self::Published], true),
            self::Published => $target === self::Archived,
            self::Archived => $target === self::Draft,
        };
    }
}
