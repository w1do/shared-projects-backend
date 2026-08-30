<?php

declare(strict_types=1);

namespace Cms\Pay\Application\DTOs\Subscription;

use Spatie\LaravelData\Data;

/** Отбор подписок: морф-алиас предмета и размер страницы. */
final class SubscriptionFilterDTO extends Data
{
    public function __construct(
        public ?string $subject_type = null,
        public int $per_page = 50,
    ) {}
}
