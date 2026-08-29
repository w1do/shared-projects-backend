<?php

declare(strict_types=1);

namespace Cms\Ai\Application\DTOs\Embed;

use Spatie\LaravelData\Data;

final class EmbedRequestDTO extends Data
{
    public function __construct(
        /** @var list<string> тексты в порядке, в котором ожидаются векторы */
        public array $texts,
    ) {}
}
