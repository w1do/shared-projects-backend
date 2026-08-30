<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Domain\Models\Project;
use Cms\Shared\Tenant\ProjectContext;

/** Локали текущего проекта: из них выбирается язык по умолчанию. */
final class ProjectLocalesQuery
{
    public function __construct(private readonly ProjectContext $context) {}

    /** @return list<string> */
    public function handle(): array
    {
        $locales = Project::query()->whereKey($this->context->required())->value('locales');

        return is_array($locales) ? array_values(array_map(strval(...), $locales)) : [];
    }
}
