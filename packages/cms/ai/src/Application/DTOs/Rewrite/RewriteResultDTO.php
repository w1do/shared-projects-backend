<?php

declare(strict_types=1);

namespace Cms\Ai\Application\DTOs\Rewrite;

use Spatie\LaravelData\Data;

final class RewriteResultDTO extends Data
{
    public function __construct(public string $text) {}
}
