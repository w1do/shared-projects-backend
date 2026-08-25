<?php

declare(strict_types=1);

namespace Cms\Pay\Console;

use Cms\Pay\PayManifest;
use Cms\Shared\AuthClient\AuthClient;
use Illuminate\Console\Command;

final class PublishManifestCommand extends Command
{
    protected $signature = 'manifest:publish';

    protected $description = 'Publish the pay service manifest to auth-service';

    public function handle(AuthClient $client): int
    {
        if (! $client->publishManifest(PayManifest::build())) {
            $this->error('auth-service rejected the manifest.');

            return self::FAILURE;
        }

        $this->info('Pay manifest published.');

        return self::SUCCESS;
    }
}
