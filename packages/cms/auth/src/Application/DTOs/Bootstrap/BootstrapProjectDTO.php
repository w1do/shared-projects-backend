<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Bootstrap;

use Cms\Auth\Domain\Models\Project;
use Spatie\LaravelData\Data;

/**
 * Проект в переключателе панели.
 *
 * `locales` отдаётся сырым значением каста — без подстановки `[]` вместо null:
 * панель читает этот список, и подмена изменила бы контракт.
 */
final class BootstrapProjectDTO extends Data
{
    /** @param  list<string>|null  $locales */
    public function __construct(
        public string $id,
        public string $key,
        public string $name,
        public ?array $locales,
    ) {}

    public static function fromModel(Project $project): self
    {
        return new self(
            id: $project->id,
            key: $project->key,
            name: $project->name,
            locales: $project->locales,
        );
    }
}
