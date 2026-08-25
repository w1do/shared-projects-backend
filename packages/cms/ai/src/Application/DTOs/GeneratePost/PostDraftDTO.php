<?php

declare(strict_types=1);

namespace Cms\Ai\Application\DTOs\GeneratePost;

use Spatie\LaravelData\Data;

/** Поля соответствуют UpsertPostDTO контента: черновик готов к созданию поста. */
final class PostDraftDTO extends Data
{
    public function __construct(
        public string $title,
        public string $slug,
        public string $body,
    ) {}
}
