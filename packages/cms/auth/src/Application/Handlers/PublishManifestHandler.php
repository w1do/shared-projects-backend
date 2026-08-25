<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\PublishManifestCommand;
use Cms\Auth\Domain\Models\ServiceManifestRecord;
use Cms\Auth\Infrastructure\Support\BootstrapCache;
use Cms\Auth\Infrastructure\Support\PermissionSyncer;

/** Регистрация манифеста сервиса: upsert записи, прав и системных ролей, сброс bootstrap-кэша. */
final class PublishManifestHandler
{
    public function __construct(private readonly PermissionSyncer $syncer) {}

    public function handle(PublishManifestCommand $command): ServiceManifestRecord
    {
        $record = ServiceManifestRecord::query()->updateOrCreate(
            ['key' => $command->manifest->key],
            ['version' => $command->manifest->version, 'manifest' => $command->manifest->toArray()],
        );

        $this->syncer->sync($command->manifest);
        BootstrapCache::bump();

        return $record;
    }
}
