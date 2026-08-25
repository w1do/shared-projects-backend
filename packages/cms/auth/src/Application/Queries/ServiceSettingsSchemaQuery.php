<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Domain\Models\ServiceManifestRecord;
use Cms\Contracts\Manifest\ServiceManifest;
use Cms\Contracts\Manifest\SettingDefinition;
use Illuminate\Support\Collection;

/**
 * Схема настроек сервиса из зарегистрированного манифеста.
 *
 * `null` и пустая схема — разные вещи: `null` означает «манифест сервиса не
 * зарегистрирован», и именно на это отвечает 422 с ключом `service`.
 */
final class ServiceSettingsSchemaQuery
{
    /** @return Collection<string, SettingDefinition>|null ключ настройки → определение */
    public function handle(string $service): ?Collection
    {
        $record = ServiceManifestRecord::query()->find($service);

        if ($record === null) {
            return null;
        }

        /** @var Collection<string, SettingDefinition> $definitions */
        $definitions = collect(ServiceManifest::fromArray((array) $record->manifest)->settings)->keyBy('key');

        return $definitions;
    }
}
