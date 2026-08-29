<?php

declare(strict_types=1);

namespace Cms\Content\Application\DTOs\Post;

use Spatie\LaravelData\Data;

/**
 * Блок содержимого поста: устойчивый идентификатор, название и текст в markdown.
 *
 * Идентификатор попадает в публичное API и в адреса на сайте, поэтому он не
 * меняется между сохранениями поста.
 */
final class PostBlockDTO extends Data
{
    public function __construct(
        public string $id,
        public string $title,
        public string $markdown,
    ) {}

    /** @param  array<string, mixed>  $block */
    public static function fromArray(array $block): self
    {
        return new self(
            id: (string) ($block['id'] ?? ''),
            title: (string) ($block['title'] ?? ''),
            markdown: (string) ($block['markdown'] ?? ''),
        );
    }
}
