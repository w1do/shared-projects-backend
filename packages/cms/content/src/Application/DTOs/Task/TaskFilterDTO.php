<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Task;

use Spatie\LaravelData\Data;

/** Отбор задач для консоли: вид работы и предмет. */
final class TaskFilterDTO extends Data
{
    public function __construct(
        public ?string $kind = null,
        public ?string $subject_type = null,
        public ?string $subject_id = null,
    ) {}
}
