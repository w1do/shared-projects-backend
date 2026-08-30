<?php

declare(strict_types=1);

namespace Cms\Research\Application\Commands;

/** Пересборка SEO-полей по AI: перечисленные сущности или все сущности проекта. */
final readonly class RebuildSeoCommand
{
    /** @param  list<array{type: string, id: int}>  $entities  пустой список — все сущности проекта */
    public function __construct(
        public array $entities = [],
        public ?string $authorId = null,
        public ?int $taskId = null,
    ) {}
}
