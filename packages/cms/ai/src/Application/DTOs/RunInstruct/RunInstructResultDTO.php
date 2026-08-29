<?php

declare(strict_types=1);

namespace Cms\Ai\Application\DTOs\RunInstruct;

use Spatie\LaravelData\Data;

final class RunInstructResultDTO extends Data
{
    public function __construct(
        /** @var array<string, mixed> ответ модели, разобранный по переданной схеме */
        public array $output,
    ) {}
}
