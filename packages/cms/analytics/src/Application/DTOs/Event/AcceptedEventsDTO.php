<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\DTOs\Event;

use Spatie\LaravelData\Data;

/** Результат приёма батча: сколько событий фактически попало в буфер. */
final class AcceptedEventsDTO extends Data
{
    public function __construct(public int $accepted) {}
}
