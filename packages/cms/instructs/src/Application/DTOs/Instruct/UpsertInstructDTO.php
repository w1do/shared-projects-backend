<?php

declare(strict_types=1);

namespace Cms\Instructs\Application\DTOs\Instruct;

use Spatie\LaravelData\Data;

/** Чистая структура между слоями: валидация — в FormRequest, HTTP сюда не попадает. */
final class UpsertInstructDTO extends Data
{
    public function __construct(
        public string $title,
        public string $category,
        public string $rule,
        /** @var array<string, mixed> JSON-схема ответа модели */
        public array $schema,
        public bool $published = false,
    ) {}

    /** @param array<string, mixed> $data провалидированные данные запроса */
    public static function fromValidated(array $data): self
    {
        /** @var array{title: string, category: string, rule: string, schema: array<string, mixed>, published?: bool} $data */
        return new self(
            title: $data['title'],
            category: $data['category'],
            rule: $data['rule'],
            schema: $data['schema'],
            published: (bool) ($data['published'] ?? false),
        );
    }
}
