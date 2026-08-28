<?php

declare(strict_types=1);

namespace Cms\Licensing\Console;

use Cms\Licensing\LicensingManifest;
use Cms\Shared\AuthClient\AuthClient;
use Illuminate\Console\Command;

/**
 * Сигнатура отличается от `manifest:publish`: licensing живёт в одном
 * приложении с pay, и одноимённая команда перекрыла бы публикацию PayManifest.
 */
final class PublishManifestCommand extends Command
{
    protected $signature = 'manifest:publish-licensing';

    protected $description = 'Publish the licensing service manifest to auth-service';

    public function handle(AuthClient $client): int
    {
        if (! $client->publishManifest(LicensingManifest::build())) {
            $this->error('auth-service rejected the manifest.');

            return self::FAILURE;
        }

        $this->info('Licensing manifest published.');

        return self::SUCCESS;
    }
}
