<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Commands\DeleteRevisionCommand;
use Cms\Content\Application\Exceptions\ContentRuleViolation;
use Cms\Content\Domain\Models\Revision;

final class DeleteRevisionHandler
{
    public function handle(DeleteRevisionCommand $command): void
    {
        $revision = Revision::query()->whereKey($command->revisionId)->first();

        if ($revision === null
            || $revision->revisable_type !== $command->post->getMorphClass()
            || $revision->revisable_id !== $command->post->getKey()
        ) {
            throw ContentRuleViolation::revisionNotOfPost();
        }

        $revision->delete();
    }
}
