<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\DTOs\Event;

use Spatie\LaravelData\Data;

/**
 * Конверт приёма событий с сайта проекта.
 *
 * Содержимое каждого элемента НЕ типизируется и НЕ валидируется поэлементно
 * (Safety Protocol, И16): отбраковка отдельных событий со счётчиком принятых
 * остаётся в handler'е, а неизвестные поля молча игнорируются нормализацией.
 */
final class CollectEventsDTO extends Data
{
    /** @param  list<mixed>  $events */
    public function __construct(public array $events) {}

    /** @param  array<string, mixed>  $validated */
    public static function fromValidated(array $validated): self
    {
        /** @var list<mixed> $events */
        $events = array_values((array) ($validated['events'] ?? []));

        return new self($events);
    }
}
