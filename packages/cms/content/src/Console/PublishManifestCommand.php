<?php

declare(strict_types=1);

namespace Cms\Content\Console;

use Cms\Content\ContentManifest;
use Cms\Shared\AuthClient\AuthClient;
use Illuminate\Console\Command;

/** Публикация манифеста content-сервиса в auth-service (вызывается на деплое). */
final class PublishManifestCommand extends Command
{
    protected $signature = 'manifest:publish';

    protected $description = 'Publish the content service manifest to auth-service';

    public function handle(AuthClient $client): int
    {
        if (! $client->publishManifest(ContentManifest::build())) {
            $this->error('auth-service rejected the manifest.');

            return self::FAILURE;
        }

        $this->info('Content manifest published.');

        return self::SUCCESS;
    }
}
