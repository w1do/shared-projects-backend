<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\IssueApiKeyCommand;
use Cms\Auth\Domain\Models\ProjectApiKey;
use Cms\Auth\Infrastructure\Support\Audit;
use Spatie\LaravelData\Optional;

final class IssueApiKeyHandler
{
    /** @return array{model: ProjectApiKey, plain: string} */
    public function handle(IssueApiKeyCommand $command): array
    {
        $scopes = $command->data->scopes instanceof Optional
            ? ($command->data->type === 'public' ? ['collect'] : ['*'])
            : $command->data->scopes;

        $issued = ProjectApiKey::issue($command->project->id, $command->data->type, $scopes);

        Audit::record('api_key.issued', $command->project->id, "key:{$issued['model']->id}", ['type' => $command->data->type]);

        return $issued;
    }
}
