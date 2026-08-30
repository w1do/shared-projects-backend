<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\Enums;

/** Сервисы платформы. */
enum ServiceName: string
{
    case Auth = 'auth';
    case Content = 'content';
    case Analytics = 'analytics';
    case Pay = 'pay';
    case Licensing = 'licensing';

    /**
     * Сервисы, которые включаются на проект. `auth` в список не входит:
     * без него проект не существует, выключать его нечем и незачем.
     * `licensing` тоже: модуль открывается вместе с `pay`.
     *
     * @return list<string>
     */
    public static function toggleable(): array
    {
        return [self::Content->value, self::Analytics->value, self::Pay->value];
    }

    /** Сервис, включённость которого открывает модуль. */
    public function gate(): self
    {
        return $this === self::Licensing ? self::Pay : $this;
    }
}
