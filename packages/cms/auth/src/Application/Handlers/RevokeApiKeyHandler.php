<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\RevokeApiKeyCommand;
use Cms\Auth\Infrastructure\Support\Audit;
use Cms\Auth\Infrastructure\Support\DownstreamNotifier;

final class RevokeApiKeyHandler
{
    public function handle(RevokeApiKeyCommand $command): void
    {
        $command->key->forceFill(['revoked_at' => now()])->save();

        Audit::record('api_key.revoked', $command->project->id, "key:{$command->key->id}");
        DownstreamNotifier::cacheBust(['reason' => 'api_key_revoked', 'project_id' => $command->project->id]);
    }
}
