<?php

declare(strict_types=1);

namespace Cms\Research\Application\DTOs\PostDraft;

use Spatie\LaravelData\Data;

/** Черновик поста от модели: то, что ещё не стало постом проекта. */
final class PostDraftDTO extends Data
{
    /**
     * @param  list<array{title: string, markdown: string}>  $blocks
     * @param  list<string>  $tags
     */
    public function __construct(
        public ?string $title,
        public ?string $slug,
        public array $blocks,
        public array $tags,
    ) {}
}
