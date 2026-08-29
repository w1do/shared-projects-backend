<?php

declare(strict_types=1);

namespace Cms\Instructs\Application\DTOs\Instruct;

use Cms\Instructs\Domain\Models\Instruct;
use Spatie\LaravelData\Data;

final class InstructDTO extends Data
{
    public function __construct(
        public int $id,
        public string $title,
        public string $category,
        public string $category_label,
        public string $rule,
        /** @var array<string, mixed> */
        public array $schema,
        public bool $published,
        public bool $is_system,
        public ?string $updated_at,
    ) {}

    public static function fromModel(Instruct $instruct): self
    {
        return new self(
            id: $instruct->id,
            title: $instruct->title,
            category: $instruct->category->value,
            category_label: $instruct->category->label(),
            rule: $instruct->rule,
            schema: $instruct->schema,
            published: $instruct->published,
            is_system: $instruct->is_system,
            updated_at: $instruct->updated_at?->toIso8601String(),
        );
    }
}
