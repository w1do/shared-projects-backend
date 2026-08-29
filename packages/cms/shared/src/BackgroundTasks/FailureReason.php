<?php

declare(strict_types=1);

namespace Cms\Shared\BackgroundTasks;

use Illuminate\Validation\ValidationException;
use Throwable;

/**
 * Причина отказа для оператора.
 *
 * Доменное правило объясняет себя само; всё остальное — родовая фраза:
 * класс исключения, стек и запрос к базе за пределы лога не выходят.
 */
final class FailureReason
{
    private const FALLBACK = 'Задача не выполнена. Попробуйте запустить её ещё раз.';

    public static function of(Throwable $error): string
    {
        if (! $error instanceof ValidationException) {
            return self::FALLBACK;
        }

        $first = collect($error->errors())->flatten()->first();

        return is_string($first) && trim($first) !== '' ? $first : self::FALLBACK;
    }
}
