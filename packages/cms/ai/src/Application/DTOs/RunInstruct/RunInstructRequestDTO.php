<?php

declare(strict_types=1);

namespace Cms\Ai\Application\DTOs\RunInstruct;

use Spatie\LaravelData\Data;

final class RunInstructRequestDTO extends Data
{
    public function __construct(
        /** Текст правила инструкции: что модель должна сделать. */
        public string $rule,
        /** @var array<string, mixed> JSON-схема ожидаемого ответа */
        public array $schema,
        /** @var array<string, mixed> входные данные операции */
        public array $input = [],
    ) {}
}
