<?php

declare(strict_types=1);

namespace Cms\Ai\Application\DTOs\Embed;

use Spatie\LaravelData\Data;

final class EmbedResultDTO extends Data
{
    public function __construct(
        /** @var list<list<float>> по вектору на каждый входной текст, в том же порядке */
        public array $vectors,
    ) {}
}
