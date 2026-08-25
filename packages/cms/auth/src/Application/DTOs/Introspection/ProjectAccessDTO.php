<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Introspection;

use Cms\Auth\Domain\Models\Project;
use Spatie\LaravelData\Data;

/**
 * Что downstream-сервису нужно знать о проекте субъекта: включённые сервисы и локали.
 *
 * Раньше эти два поля собирались двумя приватными методами, каждый из которых
 * заново грузил проект — отсюда 2–3 запроса на одну интроспекцию. Теперь проект
 * читается ровно один раз, а факты о нём снимаются с уже загруженной модели.
 */
final class ProjectAccessDTO extends Data
{
    /**
     * @param  list<string>  $enabledServices
     * @param  list<string>  $locales  локали проекта; первая — локаль по умолчанию
     */
    public function __construct(
        public array $enabledServices,
        public array $locales,
    ) {}

    /** Проекта нет (или он не определён) — оба списка пусты, как и раньше. */
    public static function none(): self
    {
        return new self([], []);
    }

    public static function fromModel(?Project $project): self
    {
        if (! $project instanceof Project) {
            return self::none();
        }

        return new self(
            enabledServices: $project->enabledServices(),
            locales: array_map('strval', $project->locales ?? []),
        );
    }
}
