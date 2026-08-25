<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Application\DTOs\ApiKey\ApiKeyDTO;
use Cms\Auth\Domain\Models\Project;
use Illuminate\Support\Collection;

final class ListApiKeysQuery
{
    /** @return Collection<int, ApiKeyDTO> */
    public function handle(Project $project): Collection
    {
        return $project->apiKeys()->orderBy('created_at')->get()->map(ApiKeyDTO::fromModel(...));
    }
}
