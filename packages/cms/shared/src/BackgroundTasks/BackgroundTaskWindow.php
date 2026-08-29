<?php

declare(strict_types=1);

namespace Cms\Shared\BackgroundTasks;

use Illuminate\Support\Carbon;

/**
 * Сроки реестра задач: сколько завершённая задача видна оператору и когда
 * незавершённая считается заброшенной. Одно значение на выдачу и на уборку —
 * иначе задача исчезала бы из консоли раньше, чем оператор увидел результат.
 */
final class BackgroundTaskWindow
{
    /** Сколько часов завершённая задача остаётся в выдаче и в таблице. */
    public const HOURS = 24;

    /** Дольше этого срока живой задача быть не может: самая долгая — минуты. */
    public const ABANDONED_HOURS = 3;

    public const ABANDONED_REASON = 'Задача не была выполнена: обработчик не сообщил о результате.';

    public static function since(): Carbon
    {
        return now()->subHours(self::HOURS);
    }

    public static function abandonedSince(): Carbon
    {
        return now()->subHours(self::ABANDONED_HOURS);
    }
}
