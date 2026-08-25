<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\RevokeApiKeyCommand;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Infrastructure\Notifications\DownstreamNotifier;
use Cms\Auth\Infrastructure\Persistence\AuditRecorder;

final class RevokeApiKeyHandler
{
    public function __construct(
        private readonly AuditRecorder $audit,
        private readonly DownstreamNotifier $downstream,
    ) {}

    public function handle(RevokeApiKeyCommand $command): void
    {
        $command->key->forceFill(['revoked_at' => now()])->save();

        $this->audit->record(AuditAction::ApiKeyRevoked, $command->project->id, "key:{$command->key->id}");
        $this->downstream->cacheBust(['reason' => 'api_key_revoked', 'project_id' => $command->project->id]);
    }
}
