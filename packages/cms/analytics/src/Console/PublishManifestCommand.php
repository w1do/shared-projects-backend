<?php

declare(strict_types=1);

namespace Cms\Analytics\Console;

use Cms\Analytics\AnalyticsManifest;
use Cms\Shared\AuthClient\AuthClient;
use Illuminate\Console\Command;

final class PublishManifestCommand extends Command
{
    protected $signature = 'manifest:publish';

    protected $description = 'Publish the analytics service manifest to auth-service';

    public function handle(AuthClient $client): int
    {
        if (! $client->publishManifest(AnalyticsManifest::build())) {
            $this->error('auth-service rejected the manifest.');

            return self::FAILURE;
        }

        $this->info('Analytics manifest published.');

        return self::SUCCESS;
    }
}
