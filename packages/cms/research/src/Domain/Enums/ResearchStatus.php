<?php

declare(strict_types=1);

namespace Cms\Research\Domain\Enums;

/** Состояние исследования; допустимые переходы описаны здесь. */
enum ResearchStatus: string
{
    case Process = 'process';
    case Done = 'done';
    case Failed = 'failed';
    case Canceled = 'canceled';

    public function label(): string
    {
        return match ($this) {
            self::Process => 'Выполняется',
            self::Done => 'Завершено',
            self::Failed => 'Ошибка',
            self::Canceled => 'Отменено',
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
            self::Done, self::Failed, self::Canceled => false,
        };
    }
}
