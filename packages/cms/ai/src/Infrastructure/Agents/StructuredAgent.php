<?php

declare(strict_types=1);

namespace Cms\Ai\Infrastructure\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

/**
 * Внутренний агент пакета: инструкция и JSON-схема задаются при создании.
 *
 * Один класс на все операции вместо пяти: инструкции — константы адаптера,
 * а фейк SDK в тестах адресуется этим классом.
 */
final class StructuredAgent implements Agent, HasStructuredOutput
{
    use Promptable;

    /** @param callable(JsonSchema): array<string, mixed> $schema */
    public function __construct(
        private readonly string $instructions,
        private $schema,
    ) {}

    public function instructions(): string
    {
        return $this->instructions;
    }

    /** @return array<string, mixed> */
    public function schema(JsonSchema $schema): array
    {
        return ($this->schema)($schema);
    }
}
