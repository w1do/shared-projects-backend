<?php

declare(strict_types=1);

namespace Cms\Analytics\Domain\ValueObjects;

/**
 * Метка времени события в формате колонки ClickHouse (`DateTime64`, UTC).
 * Нераспознанное или отсутствующее время заменяется моментом приёма.
 */
final class EventOccurredAt
{
    public static function toStorageFormat(?string $iso): string
    {
        $timestamp = $iso !== null ? strtotime($iso) : false;

        return date('Y-m-d H:i:s', $timestamp === false ? time() : $timestamp);
    }
}
