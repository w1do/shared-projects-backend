<?php

declare(strict_types=1);

namespace Cms\Ai\Application\DTOs\Normalize;

use Spatie\LaravelData\Data;

final class NormalizeResultDTO extends Data
{
    public function __construct(public string $text) {}
}
