<?php

declare(strict_types=1);

namespace Cms\Ai\Application\DTOs\GeneratePost;

use Spatie\LaravelData\Data;

final class GeneratePostRequestDTO extends Data
{
    public function __construct(
        public string $topic,
        public ?string $instructions = null,
        public string $locale = 'en',
    ) {}
}
