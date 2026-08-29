<?php

declare(strict_types=1);

namespace Cms\Shared\BackgroundTasks;

use Illuminate\Support\Carbon;

/**
 * Срок жизни завершённой задачи: столько её видит оператор и столько она
 * лежит в таблице. Одно значение на выдачу и на чистку — иначе задача исчезала
 * бы из консоли раньше, чем оператор успел увидеть результат.
 */
final class BackgroundTaskWindow
{
    public const HOURS = 24;

    public static function since(): Carbon
    {
        return now()->subHours(self::HOURS);
    }
}
