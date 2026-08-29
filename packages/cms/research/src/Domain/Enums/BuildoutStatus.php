<?php

declare(strict_types=1);

namespace Cms\Research\Domain\Enums;

/** Состояние сборки проекта по AI. */
enum BuildoutStatus: string
{
    case Process = 'process';
    case Done = 'done';
    case Failed = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::Process => 'Выполняется',
            self::Done => 'Завершена',
            self::Failed => 'Ошибка',
        };
    }

    public function isFinal(): bool
    {
        return $this !== self::Process;
    }

    public function canTransitionTo(self $target): bool
    {
        return match ($this) {
            self::Process => $target !== self::Process,
            self::Done, self::Failed => false,
        };
    }
}
