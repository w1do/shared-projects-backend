<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\IssueApiKeyCommand;
use Cms\Auth\Domain\Enums\ApiKeyType;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Domain\Models\ProjectApiKey;
use Cms\Auth\Infrastructure\Persistence\AuditRecorder;
use Spatie\LaravelData\Optional;

final class IssueApiKeyHandler
{
    public function __construct(
        private readonly AuditRecorder $audit,
    ) {}

    /** @return array{model: ProjectApiKey, plain: string} */
    public function handle(IssueApiKeyCommand $command): array
    {
        $type = ApiKeyType::from($command->data->type);

        $scopes = $command->data->scopes instanceof Optional
            ? $type->defaultScopes()
            : $command->data->scopes;

        $issued = ProjectApiKey::issue($command->project->id, $type->value, $scopes);

        $this->audit->record(AuditAction::ApiKeyIssued, $command->project->id, "key:{$issued['model']->id}", ['type' => $type->value]);

        return $issued;
    }
}
