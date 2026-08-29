<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Media;

use Spatie\LaravelData\Data;

/** Импорт медиа по внешней ссылке: адрес источника и подпись. */
final class ImportMediaDTO extends Data
{
    public function __construct(
        public string $url,
        public ?string $alt = null,
    ) {}
}
